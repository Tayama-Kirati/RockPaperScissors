# Rock Paper Scissors

A full-stack web app where you play Rock Paper Scissors against an AI that learns your patterns and gets better the more you play.

---

## Features

- **Adaptive AI** — uses a Markov Chain to study your moves and predict what you'll throw next
- **User accounts** — register, log in, and your stats are saved across sessions
- **Match history** — review every match you've played
- **Leaderboard** — see how you stack up against other players
- **Best of 3** — first to 2 round wins takes the match

---

 
 

## Quick Start

### 1. Backend

```bash
cd backend
cd backend
python -m venv venv_server
source venv_server/bin/activate
pip install fastapi "uvicorn[standard]"
uvicorn server:app --reload
```i
```

 
### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

 

---

## How the AI Works

The AI tracks what you tend to throw after each move using a **Markov Chain transition table**.

```
After Rock     → you usually throw Scissors → AI throws Rock to beat you
After Paper    → you usually throw Paper    → AI throws Scissors
After Scissors → you usually throw Rock     → AI throws Paper
```

It starts random with no data and improves every round. Your AI pattern is saved per account.

---

 