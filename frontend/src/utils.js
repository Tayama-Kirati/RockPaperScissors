import rockImg from './assets/rock.png'
import paperImg from './assets/paper.png'
import scissorsImg from './assets/scissors.png'

export const MOVES = ['Rock', 'Paper', 'Scissors']
export const COUNTER = { Rock: 'Paper', Paper: 'Scissors', Scissors: 'Rock' }
export const MOVE_IMG = { Rock: rockImg, Paper: paperImg, Scissors: scissorsImg }

export function loadData(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def }
}
export function saveData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
export function getTable(username) {
  return loadData('rps_table_' + username, {
    Rock: { Rock: 0, Paper: 0, Scissors: 0 },
    Paper: { Rock: 0, Paper: 0, Scissors: 0 },
    Scissors: { Rock: 0, Paper: 0, Scissors: 0 },
  })
}
export function saveTable(username, table) { saveData('rps_table_' + username, table) }
export function getHistory(username) { return loadData('rps_hist_' + username, []) }
export function saveHistory(username, hist) { saveData('rps_hist_' + username, hist) }

export function aiPredict(table, last) {
  if (!last) return MOVES[Math.floor(Math.random() * 3)]
  const row = table[last]
  const total = Object.values(row).reduce((a, b) => a + b, 0)
  if (total === 0) return MOVES[Math.floor(Math.random() * 3)]
  const predicted = Object.entries(row).reduce((a, b) => b[1] > a[1] ? b : a)[0]
  return COUNTER[predicted]
}

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
