import { useState } from 'react'

export default function Login({ users, loginUser, showPage }) {
  const [form, setForm]       = useState({ username: '', password: '', error: '' })
  const [showPass, setShowPass] = useState(false)

  function set(field, value) { setForm(f => ({ ...f, [field]: value, error: '' })) }

  function submit() {
    const { username: u, password: p } = form
    if (!u || !p)            return setForm(f => ({ ...f, error: 'Fill in all fields!' }))
    if (!users[u])           return setForm(f => ({ ...f, error: 'User not found. Register first!' }))
    if (users[u].password !== btoa(p)) return setForm(f => ({ ...f, error: 'Wrong password!' }))
    loginUser(u)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">Welcome Back!</div>
        <div className="auth-subtitle">Login to continue playing</div>

        <div className="form-group">
          <label>Username</label>
          <input
            placeholder="Your username"
            autoComplete="username"
            value={form.username}
            onChange={e => set('username', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="pw-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button className="pw-eye" type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-error">{form.error}</div>
        <button className="btn btn-purple form-submit" onClick={submit}>Login →</button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <a onClick={() => showPage('register')}>Register here</a>
        </p>
      </div>
    </div>
  )
}
