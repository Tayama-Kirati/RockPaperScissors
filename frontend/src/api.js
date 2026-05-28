const BASE = '/api'

function getToken() { return localStorage.getItem('rps_token') }
function setToken(t) { localStorage.setItem('rps_token', t) }

export function clearToken() { localStorage.removeItem('rps_token') }
export function hasToken() { return !!getToken() }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export async function apiRegister(username, password) {
  const data = await req('POST', '/auth/register', { username, password })
  setToken(data.token)
  return data
}

export async function apiLogin(username, password) {
  const data = await req('POST', '/auth/login', { username, password })
  setToken(data.token)
  return data
}

export async function apiGetMe()                       { return req('GET',  '/users/me') }
export async function apiGetAllUsers()                 { return req('GET',  '/users/all') }
export async function apiPlay(playerMove, lastMove)    { return req('POST', '/play', { playerMove, lastMove: lastMove || null }) }
export async function apiSaveMatch(m)                  { return req('POST', '/matches', m) }
export async function apiGetMatches()                  { return req('GET',  '/matches') }
