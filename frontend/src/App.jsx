import { useState, useEffect, useCallback } from 'react'
import logoImg from './assets/logo.png'
import { loadData, saveData, getTable, saveTable, getHistory, saveHistory, aiPredict, launchConfetti } from './utils'
import Home from './pages/Home'
import HowToPlay from './pages/HowToPlay'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [page, setPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(() => loadData('rps_session', null))
  const [users, setUsers] = useState(() => loadData('rps_users', {}))
  const [aiTable, setAiTable] = useState(() => {
    const user = loadData('rps_session', null)
    return user ? getTable(user) : {}
  })

  const [matchYouWins, setMatchYouWins] = useState(0)
  const [matchAiWins, setMatchAiWins] = useState(0)
  const [roundNum, setRoundNum] = useState(0)
  const [busy, setBusy] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [playerMove, setPlayerMove] = useState(null)
  const [aiMove, setAiMove] = useState(null)
  const [roundResult, setRoundResult] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [currentMatchHistory, setCurrentMatchHistory] = useState([])
  const [gameOver, setGameOver]         = useState({ show: false, youWon: false, youScore: 0, aiScore: 0 })
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  // ── Routing ───────────────────────────────────────────────────────

  function showPage(id) {
    if (id === 'game' && !currentUser) { setPage('login'); return }
    setPage(id)
  }

  function startOrLogin() {
    setPage(currentUser ? 'game' : 'register')
  }

  // ── Auth ──────────────────────────────────────────────────────────

  function loginUser(username) {
    setCurrentUser(username)
    saveData('rps_session', username)
    setAiTable(getTable(username))
    resetGame()
    setPage('game')
  }

  function createUser(username, password) {
    const newUsers = { ...users, [username]: { password: btoa(password), wins: 0, losses: 0, draws: 0, matches: 0 } }
    setUsers(newUsers)
    saveData('rps_users', newUsers)
    loginUser(username)
  }

  function logout() {
    setLogoutConfirm(false)
    setCurrentUser(null)
    saveData('rps_session', null)
    setPage('home')
  }

  // ── Game ──────────────────────────────────────────────────────────

  function resetGame() {
    setMatchYouWins(0); setMatchAiWins(0); setRoundNum(0)
    setCurrentMatchHistory([]); setLastMove(null); setBusy(false)
    setPlayerMove(null); setAiMove(null); setRoundResult(null)
  }

  const play = useCallback((pm) => {
    if (busy) return
    setBusy(true)
    const newRound = roundNum + 1
    setRoundNum(newRound)

    const am = aiPredict(aiTable, lastMove)

    let newTable = aiTable
    if (lastMove) {
      newTable = { ...aiTable, [lastMove]: { ...aiTable[lastMove], [pm]: (aiTable[lastMove][pm] || 0) + 1 } }
      setAiTable(newTable)
      if (currentUser) saveTable(currentUser, newTable)
    }
    setLastMove(pm)
    setShaking(true)

    const snapYouWins = matchYouWins
    const snapAiWins  = matchAiWins
    const snapHistory = currentMatchHistory

    setTimeout(() => {
      setShaking(false)
      setPlayerMove(pm)
      setAiMove(am)

      let result
      if (pm === am) result = 'draw'
      else if (
        (pm === 'Rock' && am === 'Scissors') ||
        (pm === 'Paper' && am === 'Rock') ||
        (pm === 'Scissors' && am === 'Paper')
      ) result = 'win'
      else result = 'lose'

      setRoundResult(result)

      const newYouWins = result === 'win' ? snapYouWins + 1 : snapYouWins
      const newAiWins  = result === 'lose' ? snapAiWins + 1 : snapAiWins
      setMatchYouWins(newYouWins)
      setMatchAiWins(newAiWins)

      const newHistory = [...snapHistory, { round: newRound, player: pm, ai: am, result }]
      setCurrentMatchHistory(newHistory)

      if (newYouWins === 2 || newAiWins === 2) {
        setTimeout(() => {
          const youWon = newYouWins === 2
          if (currentUser) {
            setUsers(prev => {
              const updated = { ...prev, [currentUser]: { ...prev[currentUser] } }
              updated[currentUser].matches = (updated[currentUser].matches || 0) + 1
              if (youWon) updated[currentUser].wins   = (updated[currentUser].wins   || 0) + 1
              else        updated[currentUser].losses = (updated[currentUser].losses || 0) + 1
              saveData('rps_users', updated)
              return updated
            })
            const hist = getHistory(currentUser)
            hist.unshift({ date: Date.now(), rounds: newHistory, youWins: newYouWins, aiWins: newAiWins, winner: youWon ? 'you' : 'ai' })
            saveHistory(currentUser, hist.slice(0, 50))
          }
          setGameOver({ show: true, youWon, youScore: newYouWins, aiScore: newAiWins })
          if (youWon) launchConfetti()
        }, 900)
      } else {
        setTimeout(() => {
          setPlayerMove(null); setAiMove(null); setRoundResult(null); setBusy(false)
        }, 1100)
      }
    }, 400)
  }, [busy, roundNum, aiTable, lastMove, currentUser, matchYouWins, matchAiWins, currentMatchHistory])

  useEffect(() => {
    const handler = (e) => {
      if (page !== 'game') return
      const k = e.key.toUpperCase()
      if (k === 'R') play('Rock')
      if (k === 'P') play('Paper')
      if (k === 'S') play('Scissors')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [page, play])

  function restartMatch() {
    setGameOver({ show: false, youWon: false, youScore: 0, aiScore: 0 })
    resetGame()
  }

  // ── Page map ──────────────────────────────────────────────────────

  const pages = {
    home:        <Home        startOrLogin={startOrLogin} showPage={showPage} />,
    howtoplay:   <HowToPlay   />,
    game:        <Game        currentUser={currentUser} matchYouWins={matchYouWins} matchAiWins={matchAiWins} roundNum={roundNum} busy={busy} playerMove={playerMove} aiMove={aiMove} roundResult={roundResult} shaking={shaking} play={play} matchOver={gameOver.show} onNextMatch={restartMatch} />,
    leaderboard: <Leaderboard users={users} currentUser={currentUser} />,
    history:     <History     currentUser={currentUser} />,
    login:       <Login       users={users} loginUser={loginUser} showPage={showPage} />,
    register:    <Register    users={users} createUser={createUser} showPage={showPage} />,
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <>
      <nav>
        <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); showPage('home') }}>
          <img src={logoImg} alt="Logo" />
        </a>
        <ul className="nav-links">
          <li><a onClick={() => showPage('howtoplay')}>How to Play</a></li>
          <li><a onClick={() => showPage('history')}>History</a></li>
          <li><a onClick={() => showPage('leaderboard')}>Leaderboard</a></li>
        </ul>
        <div className="nav-btns">
          {currentUser ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">{currentUser[0].toUpperCase()}</div>
                {currentUser}
                <button className="logout-btn" onClick={() => setLogoutConfirm(true)}>✕ Logout</button>
              </div>
              <button className="btn btn-purple" onClick={() => showPage('game')}>🎮 Play</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => showPage('login')}>Login</button>
              <button className="btn btn-purple" onClick={() => showPage('register')}>Register</button>
            </>
          )}
        </div>
      </nav>

      {pages[page] ?? pages.home}

      {/* GAME OVER */}
      <div className={`gameover-overlay${gameOver.show ? ' show' : ''}`}>
        <div className="gameover-card">
          <div className="gameover-emoji">{gameOver.youWon ? '🎉' : '😅'}</div>
          <div className="gameover-title">{gameOver.youWon ? 'You Win the Match!' : 'AI Wins the Match!'}</div>
          <div className="gameover-sub">{gameOver.youWon ? `Great job, ${currentUser || 'player'}!` : 'Better luck next time!'}</div>
          <div className="gameover-score">
            <div className="gos-block">
              <div className="gos-num you">{gameOver.youScore}</div>
              <div className="gos-label">{currentUser || 'You'}</div>
            </div>
            <div className="gos-block">
              <div className="gos-num ai">{gameOver.aiScore}</div>
              <div className="gos-label">AI</div>
            </div>
          </div>
          <div className="gameover-btns">
            <button className="btn btn-purple" onClick={restartMatch}>🎮 Next Match</button>
            <button className="btn btn-outline" onClick={() => { setGameOver(g => ({ ...g, show: false })); setPage('leaderboard') }}>🏆 Leaderboard</button>
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION */}
      <div className={`gameover-overlay${logoutConfirm ? ' show' : ''}`}>
        <div className="gameover-card" style={{ maxWidth: 360 }}>
          <div className="gameover-emoji">👋</div>
          <div className="gameover-title" style={{ fontSize: 28 }}>Log out?</div>
          <div className="gameover-sub">You'll need to log back in to save your stats.</div>
          <div className="gameover-btns">
            <button className="btn btn-purple" onClick={logout}>Yes, Logout</button>
            <button className="btn btn-outline" onClick={() => setLogoutConfirm(false)}>Cancel</button>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-text">
            <strong>Rock | Paper | Scissors</strong><br />
            Have fun and challenge your friends!<br />
            © 2026 Rock Paper Scissors. All rights reserved.
          </div>
          <img src={logoImg} alt="Logo" width={290} height={189} />
        </div>
      </footer>
    </>
  )
}
