from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from ai_brain import AIBrain
import sqlite3, json, os, hmac, hashlib, time, base64, secrets

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "game.db")
SECRET_KEY = os.environ.get("RPS_SECRET", "change-me-in-production-please")

DEFAULT_TABLE = {
    "Rock":     {"Rock": 0, "Paper": 0, "Scissors": 0},
    "Paper":    {"Rock": 0, "Paper": 0, "Scissors": 0},
    "Scissors": {"Rock": 0, "Paper": 0, "Scissors": 0},
}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT    UNIQUE NOT NULL,
            password_hash TEXT    NOT NULL,
            salt          TEXT    NOT NULL,
            wins          INTEGER DEFAULT 0,
            losses        INTEGER DEFAULT 0,
            matches       INTEGER DEFAULT 0,
            ai_table      TEXT    NOT NULL DEFAULT '{}'
        );
        CREATE TABLE IF NOT EXISTS matches (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL REFERENCES users(id),
            date     INTEGER NOT NULL,
            rounds   TEXT    NOT NULL,
            you_wins INTEGER NOT NULL,
            ai_wins  INTEGER NOT NULL,
            winner   TEXT    NOT NULL
        );
    """)
    conn.commit()
    conn.close()


init_db()


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_pw(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260_000).hex()


def make_token(username: str) -> str:
    payload = json.dumps({"sub": username, "exp": int(time.time()) + 86400 * 30})
    data = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    sig = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
    return f"{data}.{sig}"


def verify_token(token: str) -> str:
    try:
        data, sig = token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            raise ValueError("bad signature")
        padding = "=" * (-len(data) % 4)
        payload = json.loads(base64.urlsafe_b64decode(data + padding))
        if payload["exp"] < time.time():
            raise ValueError("token expired")
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


def current_user(authorization: str = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    return verify_token(authorization[7:])


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(body: dict):
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    if not username or not password:
        raise HTTPException(400, "Username and password required")
    if len(username) < 2:
        raise HTTPException(400, "Username too short")
    if len(password) < 3:
        raise HTTPException(400, "Password too short")
    salt = secrets.token_hex(16)
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash, salt, ai_table) VALUES (?,?,?,?)",
            (username, hash_pw(password, salt), salt, json.dumps(DEFAULT_TABLE)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(400, "Username already taken")
    finally:
        conn.close()
    return {"token": make_token(username), "username": username}


@app.post("/auth/login")
def login(body: dict):
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    if not row or hash_pw(password, row["salt"]) != row["password_hash"]:
        raise HTTPException(401, "Invalid username or password")
    return {"token": make_token(username), "username": username}


# ── Users ─────────────────────────────────────────────────────────────────────

@app.get("/users/me")
def get_me(username: str = Depends(current_user)):
    conn = get_db()
    row = conn.execute(
        "SELECT username, wins, losses, matches, ai_table FROM users WHERE username=?",
        (username,),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "User not found")
    return {**dict(row), "ai_table": json.loads(row["ai_table"])}


@app.get("/users/all")
def get_all_users():
    conn = get_db()
    rows = conn.execute(
        "SELECT username, wins, losses, matches FROM users WHERE matches > 0 ORDER BY wins DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── AI table ──────────────────────────────────────────────────────────────────

# ── Play ──────────────────────────────────────────────────────────────────────

VALID_MOVES = {"Rock", "Paper", "Scissors"}
_WINS = {("Rock", "Scissors"), ("Paper", "Rock"), ("Scissors", "Paper")}

def _result(player: str, ai: str) -> str:
    if player == ai:
        return "draw"
    return "win" if (player, ai) in _WINS else "lose"


@app.post("/play")
def play_round(body: dict, username: str = Depends(current_user)):
    player_move = body.get("playerMove")
    last_move   = body.get("lastMove")  # None on the first round

    if player_move not in VALID_MOVES:
        raise HTTPException(400, "Invalid move")

    conn = get_db()
    row = conn.execute("SELECT ai_table FROM users WHERE username=?", (username,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "User not found")

    # Load this user's pattern table into AIBrain
    brain = AIBrain(memory_file="")          # empty path → no file load
    brain.table = json.loads(row["ai_table"])

    ai_move = brain.predict(last_move)
    brain.update(last_move, player_move)     # learn from this round

    conn.execute("UPDATE users SET ai_table=? WHERE username=?", (json.dumps(brain.table), username))
    conn.commit()
    conn.close()

    return {"aiMove": ai_move, "result": _result(player_move, ai_move)}


# ── Matches ───────────────────────────────────────────────────────────────────

@app.post("/matches")
def save_match(body: dict, username: str = Depends(current_user)):
    conn = get_db()
    user = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    winner = body.get("winner", "ai")
    conn.execute(
        "INSERT INTO matches (user_id, date, rounds, you_wins, ai_wins, winner) VALUES (?,?,?,?,?,?)",
        (user["id"], body["date"], json.dumps(body["rounds"]), body["youWins"], body["aiWins"], winner),
    )
    if winner == "you":
        conn.execute("UPDATE users SET wins=wins+1, matches=matches+1 WHERE username=?", (username,))
    else:
        conn.execute("UPDATE users SET losses=losses+1, matches=matches+1 WHERE username=?", (username,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/matches")
def get_matches(username: str = Depends(current_user)):
    conn = get_db()
    user = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    rows = conn.execute(
        "SELECT date, rounds, you_wins, ai_wins, winner FROM matches "
        "WHERE user_id=? ORDER BY date DESC LIMIT 50",
        (user["id"],),
    ).fetchall()
    conn.close()
    return [
        {
            "date":    r["date"],
            "rounds":  json.loads(r["rounds"]),
            "youWins": r["you_wins"],
            "aiWins":  r["ai_wins"],
            "winner":  r["winner"],
        }
        for r in rows
    ]
