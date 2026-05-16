import homeImg from '../assets/home.jpg'
import howtoplayImg from '../assets/howtoplay.jpg'
import rockImg from '../assets/rock.png'
import paperImg from '../assets/paper.png'
import scissorsImg from '../assets/scissors.png'

const MOVES_GUIDE = [
  { img: scissorsImg, name: 'Scissor', desc: 'Hold up two fingers like scissors.' },
  { img: rockImg,     name: 'Rock',    desc: 'Make a closed fist.' },
  { img: paperImg,    name: 'Paper',   desc: 'Show your open hand with fingers straight.' },
]

export default function Home({ startOrLogin, showPage }) {
  return (
    <>
      <div className="page active">
        <section className="hero">
          <img className="game-img" src={homeImg} alt="RockPaperScissors" />
          <div className="hero-text">
            <h1>Welcome to<br />Rock.Paper.Scissors!</h1>
            <p>
              Rock Paper Scissors is a super fun and easy game you can play against the computer.<br />
              Choose Rock, Paper, or Scissors, and see who wins!<br />
              Best of 3 — first to win 2 rounds takes the match!
            </p>
            <div className="hero-cta">
              <button className="btn btn-purple" style={{ fontSize: 16, padding: '13px 30px' }} onClick={startOrLogin}>Play Now</button>
              <button className="btn btn-outline" onClick={() => showPage('howtoplay')}>How to Play</button>
            </div>
          </div>
        </section>
      </div>
      
      <div className="page active2">
            <section className="hero2">
              <div className="hero-text">
                <div className="section-title">How to Play:</div>
                <ul className="how-list">
                  <li><span className="num">1</span> Click on Rock, Paper, or Scissors.</li>
                  <li><span className="num">2</span> The computer will also make its choice.</li>
                  <li><span className="num">3</span> First to win 2 rounds wins the match!</li>
                  <li><span className="num">4</span> The winner is decided instantly!</li>
                </ul>
                <br/>

                <div className="section-title">Game Rules:</div>
                <ul className="how-list">
                  <li><span className="num">1</span>🪨 <strong>Rock beats Scissors</strong> ✂️<br /><small>(Rock can smash Scissors)</small></li>
                  <li><span className="num">2</span>✂️ <strong>Scissors beats Paper</strong> 📄<br /><small>(Scissors can cut Paper)</small></li>
                  <li><span className="num">3</span>📄 <strong>Paper beats Rock</strong> 🪨<br /><small>(Paper can cover Rock)</small></li>
                  <li><span className="num">4</span>If both choose the same thing, it's a <strong>Draw</strong></li>
                </ul>
              </div>
              <div className="hero-image">
                <img className="game-img" src={howtoplayImg} alt="Rock Paper Scissors" />
              </div>
            </section>
          </div>
      <div className="page active">
        <div className="moves-guide">
          <div className="moves-row">
            {MOVES_GUIDE.map(({ img, name, desc }) => (
              <div key={name} className="move-guide-item">
                <img src={img} alt={name} width={142} height={180} />
                <div className="mgi-info">
                  <div className="mgi-name">{name}</div>
                  <div className="mgi-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
