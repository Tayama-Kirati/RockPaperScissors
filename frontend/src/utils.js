import rockImg from './assets/rock.png'
import paperImg from './assets/paper.png'
import scissorsImg from './assets/scissors.png'

export const MOVES = ['Rock', 'Paper', 'Scissors']
export const MOVE_IMG = { Rock: rockImg, Paper: paperImg, Scissors: scissorsImg }

export function launchConfetti() {
  const colors = ['#7B4FBF', '#f5c842', '#5af5a0', '#f55a8a', '#5ab4f5', '#C8A8E8']
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.cssText = `
      left:${Math.random() * 100}vw;top:-20px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay:${Math.random()}s;animation-duration:${2 + Math.random() * 1.5}s;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 4000)
  }
}
