import { useState } from 'react'
import { apiRegister, apiGetMe } from '../api'

export default function Register({ onAuthSuccess, showPage }) {
  const [form, setForm]         = useState({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '', error: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)

  function set(field, value) { setForm(f => ({ ...f, [field]: value, error: '' })) }

  async function submit() {
    const { username: u, password: p, confirmPassword: cp } = form
    if (!u || !p)     return setForm(f => ({ ...f, error: 'Fill in all fields!' }))
    if (u.length < 2) return setForm(f => ({ ...f, error: 'Username too short!' }))
    if (p.length < 3) return setForm(f => ({ ...f, error: 'Password too short!' }))
    if (p !== cp)     return setForm(f => ({ ...f, error: 'Passwords do not match!' }))
    setLoading(true)
    try {
      await apiRegister(u, p)
      const me = await apiGetMe()
      onAuthSuccess(me.username)
    } catch (err) {
      setForm(f => ({ ...f, error: err.message || 'Registration failed' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">Create Account</div>
        <div className="auth-subtitle">Join and start playing!</div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input placeholder="First name" autoComplete="given-name" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input placeholder="Last name" autoComplete="family-name" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Username</label>
          <input placeholder="Choose a username" autoComplete="username" value={form.username} onChange={e => set('username', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="pw-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Choose a password"
              autoComplete="new-password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
            <button className="pw-eye" type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <div className="pw-wrap">
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button className="pw-eye" type="button" onClick={() => setShowConf(v => !v)} tabIndex={-1}>
              {showConf ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div className="form-error">{form.error}</div>
        <button className="btn btn-purple form-submit" onClick={submit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account →'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <a onClick={() => showPage('login')}>Login here</a>
        </p>
      </div>
    </div>
  )
}
