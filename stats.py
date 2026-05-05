"""
stats.py — Tracks scores and session history.
Also saves/loads lifetime stats from a JSON file.
"""

import json
import os


class Stats:
    STATS_FILE = "stats.json"

    def __init__(self):
        self.session_wins = 0
        self.session_losses = 0
        self.session_draws = 0
        self.history = []   # list of dicts: {player, ai, result}

        # Load lifetime stats
        if os.path.exists(self.STATS_FILE):
            try:
                with open(self.STATS_FILE, "r") as f:
                    data = json.load(f)
                self.lifetime_wins   = data.get("wins", 0)
                self.lifetime_losses = data.get("losses", 0)
                self.lifetime_draws  = data.get("draws", 0)
            except (json.JSONDecodeError, KeyError):
                self._reset_lifetime()
        else:
            self._reset_lifetime()

    def _reset_lifetime(self):
        self.lifetime_wins = 0
        self.lifetime_losses = 0
        self.lifetime_draws = 0

    def record(self, result, player_move, ai_move):
        """Record one round's outcome."""
        self.history.append({
            "round": self.total_rounds() + 1,
            "player": player_move,
            "ai": ai_move,
            "result": result,
        })
        if result == "player":
            self.session_wins += 1
            self.lifetime_wins += 1
        elif result == "ai":
            self.session_losses += 1
            self.lifetime_losses += 1
        else:
            self.session_draws += 1
            self.lifetime_draws += 1

    def total_rounds(self):
        return self.session_wins + self.session_losses + self.session_draws

    def session_summary(self):
        t = self.total_rounds()
        if t == 0:
            return "No rounds played this session."
        pct = round(self.session_wins / t * 100)
        return (
            f"  Session:  {t} rounds  |  "
            f"You {self.session_wins}  AI {self.session_losses}  "
            f"Draw {self.session_draws}  |  Win rate {pct}%"
        )

    def lifetime_summary(self):
        t = self.lifetime_wins + self.lifetime_losses + self.lifetime_draws
        if t == 0:
            return "  Lifetime: No games yet."
        pct = round(self.lifetime_wins / t * 100)
        return (
            f"  Lifetime: {t} rounds  |  "
            f"You {self.lifetime_wins}  AI {self.lifetime_losses}  "
            f"Draw {self.lifetime_draws}  |  Win rate {pct}%"
        )

    def move_frequency(self):
        """How often the player chose each move this session."""
        freq = {"Rock": 0, "Paper": 0, "Scissors": 0}
        for h in self.history:
            freq[h["player"]] += 1
        return freq

    def save(self):
        """Persist lifetime stats."""
        with open(self.STATS_FILE, "w") as f:
            json.dump({
                "wins":   self.lifetime_wins,
                "losses": self.lifetime_losses,
                "draws":  self.lifetime_draws,
            }, f, indent=2)

    def reset_lifetime(self):
        self._reset_lifetime()
        if os.path.exists(self.STATS_FILE):
            os.remove(self.STATS_FILE)