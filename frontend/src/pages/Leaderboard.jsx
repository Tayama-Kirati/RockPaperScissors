const PODIUM = [
  { bg: '#FFD700', shadow: '#e6b800', label: '1st Place', crown: '👑' },
  { bg: '#C0C0C0', shadow: '#a8a8a8', label: '2nd Place', crown: '🥈' },
  { bg: '#CD7F32', shadow: '#b06a22', label: '3rd Place', crown: '🥉' },
]

function WinBar({ winrate }) {
  const color = winrate >= 70 ? '#5ecb8a' : winrate >= 40 ? '#f5c842' : '#f55a8a'
  return (
    <div className="kid-winbar-track">
      <div className="kid-winbar-fill" style={{ width: `${winrate}%`, background: color }} />
      <span className="kid-winbar-label">{winrate}%</span>
    </div>
  )
}

function Avatar({ name, size = 52, isYou }) {
  return (
    <div className="kid-avatar" style={{ width: size, height: size, fontSize: size * 0.45, background: isYou ? '#7B4FBF' : '#9B6FDF' }}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function Leaderboard({ users, currentUser }) {
  const entries = Object.entries(users)
    .filter(([, u]) => (u.matches || 0) > 0)
    .map(([name, u]) => ({
      name,
      wins:    u.wins    || 0,
      losses:  u.losses  || 0,
      matches: u.matches || 0,
      winrate: u.matches > 0 ? Math.round((u.wins || 0) / u.matches * 100) : 0,
    }))
    .sort((a, b) => b.winrate - a.winrate || b.wins - a.wins)

  return (
    <div className="kid-page">
      <div className="kid-page-header">
        <div className="kid-page-title">🏆 Leaderboard</div>
        <div className="kid-page-sub">Who is the best player?</div>
      </div>

      {entries.length === 0 ? (
        <div className="kid-empty">
          <div className="kid-empty-icon">🏆</div>
          <div className="kid-empty-text">No one here yet!</div>
          <div className="kid-empty-hint">Play some games to show up here.</div>
        </div>
      ) : (
        <div className="kid-lb-list">
          {entries.map((e, i) => {
            const isYou  = e.name === currentUser
            const podium = PODIUM[i]
            return (
              <div
                key={e.name}
                className={`kid-lb-card${isYou ? ' is-you' : ''}${i < 3 ? ' podium' : ''}`}
                style={podium ? { borderColor: podium.bg, background: `linear-gradient(135deg, ${podium.bg}22, white)` } : {}}
              >
                {/* Rank badge */}
                <div className="kid-lb-rank">
                  {i < 3
                    ? <span className="kid-rank-crown">{podium.crown}</span>
                    : <span className="kid-rank-num">{i + 1}</span>
                  }
                </div>

                {/* Avatar + name */}
                <Avatar name={e.name} isYou={isYou} />
                <div className="kid-lb-info">
                  <div className="kid-lb-name">
                    {e.name}
                    {isYou && <span className="kid-you-tag">That's you!</span>}
                  </div>
                  <WinBar winrate={e.winrate} />
                </div>

                {/* Stats pills */}
                <div className="kid-lb-stats">
                  <div className="kid-stat-pill green">🏅 {e.wins} wins</div>
                  <div className="kid-stat-pill red">💨 {e.losses} losses</div>
                  <div className="kid-stat-pill purple">🎮 {e.matches} games</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
