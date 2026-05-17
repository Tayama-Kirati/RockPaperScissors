import json
import os
import random


class AIBrain:
    MOVES = ["Rock", "Paper", "Scissors"]

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
        return {m: {n: 0 for n in self.MOVES} for m in self.MOVES}

    def predict(self, last_move):
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
        if last_move is not None:
            self.table[last_move][player_move] += 1

    def confidence(self, last_move):
        if last_move is None:
            return 0
        row = self.table.get(last_move, {})
        total = sum(row.values())
        if total == 0:
            return 0
        top = max(row.values())
        return round((top / total) * 100)

    def total_observations(self):
        return sum(v for row in self.table.values() for v in row.values())

    def save(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.table, f, indent=2)

    def reset(self):
        self.table = self._empty_table()
        if os.path.exists(self.memory_file):
            os.remove(self.memory_file)