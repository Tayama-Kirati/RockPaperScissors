"""
game_logic.py — Pure rules of Rock Paper Scissors.
No AI, no state — just: who wins?
"""

RULES = {
    ("Rock",     "Scissors"): "player",
    ("Paper",    "Rock"):     "player",
    ("Scissors", "Paper"):    "player",
    ("Scissors", "Rock"):     "ai",
    ("Rock",     "Paper"):    "ai",
    ("Paper",    "Scissors"): "ai",
}

EMOJI = {
    "Rock":     "🪨",
    "Paper":    "📄",
    "Scissors": "✂️ ",
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
    """
    Returns one of: 'player', 'ai', 'draw'
    """
    if player_move == ai_move:
        return "draw"
    return RULES.get((player_move, ai_move), "draw")


def result_message(result, player_move, ai_move):
    """
    Build a human-readable result string.
    """
    pe = EMOJI[player_move]
    ae = EMOJI[ai_move]

    if result == "draw":
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  It's a draw!"
    elif result == "player":
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  You win! 🎉"
    else:
        return f"  {pe} {player_move}  vs  {ae} {ai_move}  →  AI wins! 🤖"


def parse_input(raw):
    """
    Accept R/P/S or 1/2/3 or full words. Returns move name or None.
    """
    cleaned = raw.strip().upper()
    if cleaned in MOVE_MAP:
        return MOVE_MAP[cleaned]
    # Try full word
    title = raw.strip().title()
    if title in ("Rock", "Paper", "Scissors"):
        return title
    return None