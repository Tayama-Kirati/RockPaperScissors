import { MOVE_IMG } from '../utils'
import rockImg from '../assets/rock.png'
import paperImg from '../assets/paper.png'
import scissorsImg from '../assets/scissors.png'

const CHOICES = [
  { move: 'Scissors', img: scissorsImg, key: 'S' },
  { move: 'Rock',     img: rockImg,     key: 'R' },
  { move: 'Paper',    img: paperImg,    key: 'P' },
]

export default function Game({ currentUser, matchYouWins, matchAiWins, roundNum, busy, playerMove, aiMove, roundResult, shaking, play }) {
  return (
    <div className="page2">
      <div className="game-page">
        <div className="game-topbar">
          <div className="game-welcome">{currentUser ? `Hey ${currentUser}! 🎮` : "Let's Play!"}</div>
          <div className="game-round-badge">Round {roundNum + 1} of Best-of-3</div>
        </div>

        <div className="bo3-tracker">
          <div className="bo3-side">
            <div className="bo3-name">{currentUser ? currentUser.toUpperCase() : 'YOU'}</div>
            <div className="bo3-pips">
              <div className={`pip you${matchYouWins > 0 ? ' filled' : ''}`} />
              <div className={`pip you${matchYouWins > 1 ? ' filled' : ''}`} />
            </div>
          </div>
          <div className="bo3-vs">VS</div>
          <div className="bo3-side">
            <div className="bo3-name">AI</div>
            <div className="bo3-pips">
              <div className={`pip ai${matchAiWins > 0 ? ' filled' : ''}`} />
              <div className={`pip ai${matchAiWins > 1 ? ' filled' : ''}`} />
            </div>
          </div>
        </div>

        <div className="arena-wrap striped">
          <div className="arena-stage">
            <div className="stage-side">
              <div className="stage-label">User</div>
              <div className={`stage-hand-box${shaking ? ' shake' : ''}${roundResult === 'win' ? ' win-glow' : roundResult === 'lose' ? ' lose-glow' : ''}`}>
                {playerMove && <img src={MOVE_IMG[playerMove]} alt={playerMove} style={{ width: 120 }} />}
              </div>
            </div>
            <div className="vs-circle">VS</div>
            <div className="stage-side">
              <div className="stage-label">Computer</div>
              <div className={`stage-hand-box${shaking ? ' shake' : ''}${roundResult === 'lose' ? ' win-glow' : roundResult === 'win' ? ' lose-glow' : ''}`}>
                {aiMove && <img src={MOVE_IMG[aiMove]} alt={aiMove} style={{ width: 120 }} />}
              </div>
            </div>
          </div>
          <div className="result-msg">
            <div className={`rm-inner${roundResult ? ` show ${roundResult}` : ''}`}>
              {roundResult === 'win'  && '🎉 You Win this Round!'}
              {roundResult === 'lose' && '🤖 AI Wins this Round!'}
              {roundResult === 'draw' && '🤝 Draw!'}
            </div>
          </div>
        </div>

        <div className="choose-label">Choose Your Move</div>
        <div className="choose-grid">
          {CHOICES.map(({ move, img, key }) => (
            <button key={move} className="choose-card" onClick={() => play(move)} disabled={busy}>
              <img src={img} alt={move} width={142} height={180} />
              <span className="cc-name">{move}</span>
              <span className="cc-key">Press {key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
