import { getHistory, MOVE_IMG } from '../utils'

const MOVE_EMOJI = { Rock: '✊', Paper: '✋', Scissors: '✌️' }

function friendlyDate(ts) {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return new Date(ts).toLocaleDateString()
}

function RoundRow({ r }) {
  const isWin  = r.result === 'win'
  const isLose = r.result === 'lose'
  const isDraw = r.result === 'draw'

  return (
    <div className="kid-round-row">
      <span className="kid-round-num">Round {r.round}</span>

      <div className="kid-round-moves">
        <div className="kid-round-move">
          <img src={MOVE_IMG[r.player]} alt={r.player} width={38} height={48} />
          <span>{MOVE_EMOJI[r.player]} You</span>
        </div>
        <span className="kid-round-vs">VS</span>
        <div className="kid-round-move">
          <img src={MOVE_IMG[r.ai]} alt={r.ai} width={38} height={48} />
          <span>{MOVE_EMOJI[r.ai]} AI</span>
        </div>
      </div>

      <div className={`kid-round-result ${r.result}`}>
        {isWin  && '🎉 You win!'}
        {isLose && '🤖 AI wins'}
        {isDraw && '🤝 Draw!'}
      </div>
    </div>
  )
}

function MatchCard({ match, matchNum, currentUser }) {
  const youWon = match.winner === 'you'
  return (
    <div className={`kid-match-card ${youWon ? 'match-win' : 'match-lose'}`}>
      <div className="kid-match-header">
        <div className="kid-match-result-badge">
          {youWon ? '🎉 You Won!' : '🤖 AI Won!'}
        </div>
        <div className="kid-match-meta">
          <span>Match #{matchNum}</span>
          <span className="kid-match-dot">·</span>
          <span>{friendlyDate(match.date)}</span>
          <span className="kid-match-dot">·</span>
          <span className="kid-score">{match.youWins} – {match.aiWins}</span>
        </div>
      </div>

      <div className="kid-rounds-list">
        {match.rounds.map(r => <RoundRow key={r.round} r={r} />)}
      </div>
    </div>
  )
}

export default function History({ currentUser }) {
  if (!currentUser) {
    return (
      <div className="kid-page">
        <div className="kid-page-header">
          <div className="kid-page-title">📜 My History</div>
          <div className="kid-page-sub">See all your past games!</div>
        </div>
        <div className="kid-empty">
          <div className="kid-empty-icon">🔒</div>
          <div className="kid-empty-text">You need to log in first!</div>
          <div className="kid-empty-hint">Login or Register to save your matches.</div>
        </div>
      </div>
    )
  }

  const historyData = getHistory(currentUser)

  return (
    <div className="kid-page">
      <div className="kid-page-header">
        <div className="kid-page-title">📜 My History</div>
        <div className="kid-page-sub">Hi {currentUser}! Here are your last games.</div>
      </div>

      {historyData.length === 0 ? (
        <div className="kid-empty">
          <div className="kid-empty-icon">🎮</div>
          <div className="kid-empty-text">No games yet!</div>
          <div className="kid-empty-hint">Go play and come back here to see your matches.</div>
        </div>
      ) : (
        <div className="kid-match-list">
          {historyData.slice(0, 20).map((match, mi) => (
            <MatchCard
              key={mi}
              match={match}
              matchNum={historyData.length - mi}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}
