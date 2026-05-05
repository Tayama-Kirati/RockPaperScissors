"""
main.py — Game loop. Ties all modules together.

Run with:  python main.py
"""

from ai_brain import AIBrain
from game_logic import get_result, result_message, parse_input
from stats import Stats
import display


def main():
    brain = AIBrain()
    stats = Stats()
    last_move = None          # AI needs this to predict
    consecutive_wins = 0      # for win streaks
    consecutive_losses = 0

    display.clear()
    display.banner()

    if brain.loaded_memory:
        print(f"\n  ✅  AI loaded memory ({brain.total_observations()} observations)")
    if stats.lifetime_wins + stats.lifetime_losses + stats.lifetime_draws > 0:
        print(f"  📊  Lifetime record: {stats.lifetime_summary().strip()}")

    display.menu()

    while True:
        display.scoreboard(stats, brain)
        raw = input("  Your move: ").strip()

        # ── Special commands ──────────────────────────────────────
        if raw.upper() == "Q":
            display.loading_bar("Saving")
            brain.save()
            stats.save()
            print(stats.session_summary())
            print(stats.lifetime_summary())
            print("\n  Bye! Come back to keep training the AI. 👋\n")
            break

        if raw.upper() == "H":
            display.history_table(stats)
            input("  (Press Enter to continue)")
            display.clear()
            display.banner()
            continue

        if raw.upper() == "STATS":
            display.full_stats(stats, brain)
            input("  (Press Enter to continue)")
            display.clear()
            display.banner()
            continue

        if raw.upper() == "RESET":
            confirm = input("  Reset ALL AI memory and lifetime stats? (yes/no): ")
            if confirm.strip().lower() == "yes":
                brain.reset()
                stats.reset_lifetime()
                last_move = None
                print("  ✅  AI memory and lifetime stats cleared.\n")
            else:
                print("  Cancelled.\n")
            continue

        if raw.upper() == "MENU":
            display.menu()
            continue

        # ── Parse move ────────────────────────────────────────────
        player_move = parse_input(raw)
        if player_move is None:
            print("  ❌  Invalid input. Use R / P / S, or 1 / 2 / 3.\n")
            continue

        # ── AI predicts BEFORE updating its memory ────────────────
        ai_move = brain.predict(last_move)

        # ── Determine winner ──────────────────────────────────────
        result = get_result(player_move, ai_move)

        # ── AI learns from what just happened ─────────────────────
        brain.update(last_move, player_move)
        last_move = player_move

        # ── Record stats ──────────────────────────────────────────
        stats.record(result, player_move, ai_move)

        # ── Print result ──────────────────────────────────────────
        display.round_result(result_message(result, player_move, ai_move))

        # ── Win / loss streaks ────────────────────────────────────
        if result == "player":
            consecutive_wins += 1
            consecutive_losses = 0
            if consecutive_wins == 3:
                print("  🔥  Three in a row! The AI is watching closely now...\n")
            elif consecutive_wins == 5:
                print("  👑  FIVE WIN STREAK! Can you keep it up?\n")
        elif result == "ai":
            consecutive_losses += 1
            consecutive_wins = 0
            if consecutive_losses == 3:
                print("  😬  AI on a 3-game run — it may have figured you out!\n")
        else:
            consecutive_wins = 0
            consecutive_losses = 0

        # ── Auto-save every 10 rounds ─────────────────────────────
        if stats.total_rounds() % 10 == 0:
            brain.save()
            stats.save()


if __name__ == "__main__":
    main()