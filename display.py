import os
import time


def clear():
    
    os.system("cls" if os.name == "nt" else "clear")


def banner():
    print("=" * 52)
    print("=" * 52)
    print("  The AI learns your patterns and adapts!")
    print("=" * 52)


def menu():
    print("\n  Controls:")
    print("    R or 1 → Rock")
    print("    P or 2 → Paper")
    print("    S or 3 → Scissors")
    print("    H      → Show move history")
    print("    STATS  → Show full stats")
    print("    RESET  → Wipe AI memory")
    print("    Q      → Save & quit")
    print()


def scoreboard(stats, brain):
    obs = brain.total_observations()
    ai_label = "random" if obs < 5 else f"learning ({obs} obs)"
    print(f"\n  {'─'*48}")
    print(f"  Score  →  You: {stats.session_wins}   "
          f"AI: {stats.session_losses}   "
          f"Draw: {stats.session_draws}")
    print(f"  AI mode: {ai_label}")
    print(f"  {'─'*48}\n")


def round_result(message):
    print()
    print(message)
    print()


def history_table(stats):
    if not stats.history:
        print("\n  No rounds played yet.\n")
        return
    print(f"\n  {'Rnd':>4}  {'You':<10} {'AI':<10} {'Result'}")
    print(f"  {'─'*38}")
    for h in stats.history[-15:]:   # show last 15 rounds
        result_str = {
            "player": "You win",
            "ai":     "AI wins",
            "draw":   "Draw   ",
        }[h["result"]]
        print(f"  {h['round']:>4}  {h['player']:<10} {h['ai']:<10} {result_str}")
    print()


def full_stats(stats, brain):
    print(f"\n  {'═'*48}")
    print("   SESSION STATS")
    print(f"  {'─'*48}")
    print(stats.session_summary())
    print(f"\n   LIFETIME STATS")
    print(f"  {'─'*48}")
    print(stats.lifetime_summary())

    freq = stats.move_frequency()
    total = sum(freq.values())
    if total > 0:
        print(f"\n   YOUR MOVE HABITS (this session)")
        print(f"  {'─'*48}")
        for move, count in freq.items():
            pct = round(count / total * 100)
            bar = "█" * (pct // 5)
            print(f"  {move:<10} {bar:<20} {pct}%")

    print(f"\n   AI MEMORY")
    print(f"  {'─'*48}")
    obs = brain.total_observations()
    print(f"  Total observations: {obs}")
    if obs >= 5:
        print("  Transition table (what AI has learned):")
        for after, row in brain.table.items():
            total_row = sum(row.values())
            if total_row == 0:
                continue
            top = max(row, key=row.get)
            conf = brain.confidence(after)
            print(f"    After {after:<10} → predicts {top:<10} ({conf}% conf)")
    else:
        print("  Not enough data yet (need 5+ rounds).")
    print(f"  {'═'*48}\n")


def loading_bar(label="Saving", steps=12, delay=0.04):
    print(f"\n  {label} ", end="", flush=True)
    for _ in range(steps):
        print("▓", end="", flush=True)
        time.sleep(delay)
    print(" done!\n")