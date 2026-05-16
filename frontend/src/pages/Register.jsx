import { useState } from 'react'

export default function Register({ users, createUser, showPage }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '', error: '' })

  function set(field, value) { setForm(f => ({ ...f, [field]: value, error: '' })) }

  function submit() {
    const { username: u, password: p, confirmPassword: cp } = form
    if (!u || !p)          return setForm(f => ({ ...f, error: 'Fill in all fields!' }))
    if (u.length < 2)      return setForm(f => ({ ...f, error: 'Username too short!' }))
    if (p.length < 3)      return setForm(f => ({ ...f, error: 'Password too short!' }))
    if (p !== cp)          return setForm(f => ({ ...f, error: 'Passwords do not match!' }))
    if (users[u])          return setForm(f => ({ ...f, error: 'Username already taken!' }))
    createUser(u, p)
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
          <input type="password" placeholder="Choose a password" autoComplete="new-password" value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" autoComplete="new-password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <div className="form-error">{form.error}</div>
        <button className="btn btn-purple form-submit" onClick={submit}>Create Account →</button>

        <p className="auth-switch">
          Already have an account?{' '}
          <a onClick={() => showPage('login')}>Login here</a>
        </p>
      </div>
    </div>
  )
}
