const RANK_CLASS = ['top-1', 'top-2', 'top-3']

function RankBadge({ index }) {
  if (index === 0) return <span className="rank-badge rank-1">🥇</span>
  if (index === 1) return <span className="rank-badge rank-2">🥈</span>
  if (index === 2) return <span className="rank-badge rank-3">🥉</span>
  return <span className="rank-badge rank-n">{index + 1}</span>
}

export default function Leaderboard({ users, currentUser }) {
  const entries = Object.entries(users)
    .filter(([, u]) => (u.matches || 0) > 0)
    .map(([name, u]) => ({
      name,
      wins: u.wins || 0,
      losses: u.losses || 0,
      matches: u.matches || 0,
      winrate: u.matches > 0 ? Math.round((u.wins || 0) / u.matches * 100) : 0,
    }))
    .sort((a, b) => b.winrate - a.winrate || b.wins - a.wins)

  return (
    <div className="lb-page">
      <div className="lb-title">Leadership Board</div>
      <div className="lb-subtitle">Top players ranked by win rate (minimum 1 match played)</div>

      {entries.length === 0 ? (
        <div className="lb-empty"><div>🏆</div>No players yet! Register and play to appear here.</div>
      ) : (
        <table className="lb-table">
          <thead>
            <tr>
              <th className="lb-rank">#</th>
              <th>Player</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Matches</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.name} className={`lb-row ${RANK_CLASS[i] || ''}`}>
                <td className="lb-rank"><RankBadge index={i} /></td>
                <td className="lb-name" style={{ fontWeight: 800 }}>
                  {e.name}
                  {e.name === currentUser && <span style={{ fontSize: 11, color: 'var(--purple)' }}> (you)</span>}
                </td>
                <td className="lb-wins">✅ {e.wins}</td>
                <td className="lb-losses">❌ {e.losses}</td>
                <td>{e.matches}</td>
                <td className="lb-winrate">{e.winrate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
