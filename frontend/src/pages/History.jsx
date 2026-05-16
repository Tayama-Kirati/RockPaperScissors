import { getHistory } from '../utils'
import { MOVE_IMG } from '../utils'

export default function History({ currentUser }) {
  if (!currentUser) {
    return (
      <div className="hist-page">
        <div className="hist-title">Match History</div>
        <div className="hist-subtitle">Your recent matches</div>
        <div className="hist-empty"><div>🔒</div>Login to see your match history!</div>
      </div>
    )
  }

  const historyData = getHistory(currentUser)

  return (
    <div className="hist-page">
      <div className="hist-title">Match History</div>
      <div className="hist-subtitle">{currentUser}'s recent matches</div>

      {historyData.length === 0 ? (
        <div className="hist-empty"><div>📜</div>No matches played yet. Go play!</div>
      ) : (
        historyData.slice(0, 20).map((match, mi) => (
          <div key={mi} style={{ marginBottom: '1.5rem' }}>
            <div className="hist-series-header">
              Match {historyData.length - mi} · {new Date(match.date).toLocaleDateString()} · {match.youWins}-{match.aiWins} · {match.winner === 'you' ? `🎉 ${currentUser} wins` : '🤖 AI wins'}
            </div>
            {match.rounds.map(r => (
              <div key={r.round} className="hist-item">
                <span className="hist-round">R{r.round}</span>
                <div className="hist-moves">
                  <img src={MOVE_IMG[r.player]} alt={r.player} width={20} /> {r.player}
                  <span className="hm-sep">VS</span>
                  <img src={MOVE_IMG[r.ai]} alt={r.ai} width={20} /> {r.ai}
                </div>
                <span className={`hist-result ${r.result}`}>
                  {r.result === 'win' ? 'You Win' : r.result === 'lose' ? 'AI Wins' : 'Draw'}
                </span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
