"""
ai_brain.py — The AI's machine learning engine.

Uses a Markov Chain: tracks what move YOU tend to play
after each of your previous moves, then counters it.
The more you play, the smarter it gets.
"""

import json
import os
import random


class AIBrain:
    MOVES = ["Rock", "Paper", "Scissors"]

    # What beats what
    COUNTER = {
        "Rock": "Paper",
        "Paper": "Scissors",
        "Scissors": "Rock",
    }

    def __init__(self, memory_file="memory.json"):
        self.memory_file = memory_file
        self.loaded_memory = False

        if os.path.exists(memory_file):
            try:
                with open(memory_file, "r") as f:
                    self.table = json.load(f)
                self.loaded_memory = True
            except (json.JSONDecodeError, KeyError):
                self.table = self._empty_table()
        else:
            self.table = self._empty_table()

    def _empty_table(self):
        """Create a blank transition table."""
        return {m: {n: 0 for n in self.MOVES} for m in self.MOVES}

    def predict(self, last_move):
        """
        Given the player's last move, predict what they'll play next
        and return the move that BEATS that prediction.
        Falls back to random if no data exists yet.
        """
        if last_move is None:
            return random.choice(self.MOVES)

        row = self.table.get(last_move, {})
        total = sum(row.values())

        if total == 0:
            return random.choice(self.MOVES)

        # Pick the move player most likely plays next
        predicted_player_move = max(row, key=row.get)

        # Play what beats it
        return self.COUNTER[predicted_player_move]

    def update(self, last_move, player_move):
        """
        Record that after playing `last_move`, the player chose `player_move`.
        This is how the AI learns.
        """
        if last_move is not None:
            self.table[last_move][player_move] += 1

    def confidence(self, last_move):
        """
        Return a rough confidence % — how dominant is the top prediction?
        Returns 0 if no data.
        """
        if last_move is None:
            return 0
        row = self.table.get(last_move, {})
        total = sum(row.values())
        if total == 0:
            return 0
        top = max(row.values())
        return round((top / total) * 100)

    def total_observations(self):
        """How many move transitions has the AI observed so far."""
        return sum(v for row in self.table.values() for v in row.values())

    def save(self):
        """Persist the learned transition table to disk."""
        with open(self.memory_file, "w") as f:
            json.dump(self.table, f, indent=2)

    def reset(self):
        """Wipe all learned data."""
        self.table = self._empty_table()
        if os.path.exists(self.memory_file):
            os.remove(self.memory_file)