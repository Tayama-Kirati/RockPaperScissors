RULES = {
    ("Rock",     "Scissors"): "player",
    ("Paper",    "Rock"):     "player",
    ("Scissors", "Paper"):    "player",
    ("Scissors", "Rock"):     "ai",
    ("Rock",     "Paper"):    "ai",
    ("Paper",    "Scissors"): "ai",
}

EMOJI = {
    "Rock":     "images/rock.png",
    "Paper":    "images/paper.png",
    "Scissors": "images/scissors.png",
}

MOVE_MAP = {
    "R": "Rock",
    "P": "Paper",
    "S": "Scissors",
    "1": "Rock",
    "2": "Paper",
    "3": "Scissors",
}


def get_result(player_move, ai_move):
    if player_move == ai_move:
        return "draw"
    return RULES.get((player_move, ai_move), "draw")


def result_message(result, player_move, ai_move):
    pe = EMOJI[player_move]
    ae = EMOJI[ai_move]

    if result == "draw":
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  It's a draw!"
    elif result == "player":
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  You win! "
    else:
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  Computer wins! "


def parse_input(raw):
    
    cleaned = raw.strip().upper()
    if cleaned in MOVE_MAP:
        return MOVE_MAP[cleaned]
    # Try full word
    title = raw.strip().title()
    if title in ("Rock", "Paper", "Scissors"):
        return title
    return None