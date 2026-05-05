# RockPaperScissors
# Rock Paper Scissors — AI Edition 🤖

A beginner-friendly Python project where an AI learns your playing patterns
using a Markov Chain (a real machine learning technique) and gets better at
beating you the more you play.

---

## Quick Start

```bash
# 1. Navigate to the folder
cd rps_ai_game

# 2. Run the game — no pip install needed!
python main.py
```

Requires **Python 3.7+**. Uses only the standard library (json, os, random, time).

---

## Controls

| Input         | Action               |
|---------------|----------------------|
| `R` or `1`    | Play Rock            |
| `P` or `2`    | Play Paper           |
| `S` or `3`    | Play Scissors        |
| `H`           | View round history   |
| `STATS`       | Full stats + AI data |
| `RESET`       | Wipe AI memory       |
| `Q`           | Save and quit        |

---
## How the AI Works

The AI uses a **Markov Chain** — a simple but real ML concept.

It builds a **transition table** that tracks: after you play X, what do you
tend to play next? For example, after noticing you play Rock → Scissors often,
it starts playing Rock to counter your likely Scissors.

```
After Rock     → player most often plays Scissors → AI plays Rock
After Paper    → player most often plays Paper    → AI plays Scissors
After Scissors → player most often plays Rock     → AI plays Paper
```

The AI starts completely random (no data) and improves with each round.
It saves its memory to `memory.json`, so it remembers you across sessions!

---

## Learning Goals

By building this project you'll learn:

- **Classes & OOP** — AIBrain, Stats are reusable objects
- **File I/O & JSON** — save/load AI memory and scores
- **Markov Chains** — a foundational ML concept
- **Modular code** — 5 files, each with one clear job
- **Game loops** — input → process → output, repeating

---

## Ideas to Extend It

1. Add a **GUI** using `tkinter` (Python's built-in UI library)
2. Swap Markov Chain for **scikit-learn** (Naive Bayes classifier)
3. Add **difficulty levels** (easy = random, hard = full ML)
4. Add a **best-of-N** tournament mode
5. Build a **web version** using Flask or FastAPI