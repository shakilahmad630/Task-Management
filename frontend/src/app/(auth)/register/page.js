'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'name is required.'
    if (form.name.length < 2) e.name = 'name must be ≥ 2 characters.'
    if (!form.email.trim()) e.email = 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!form.password) e.password = 'Password is required.'
    if (form.password.length < 6) e.password = 'Password must be ≥ 6 characters.'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setErrors({})
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      toast.success('Account created! Please log in.')
      router.push('/login')
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  const cls = (f) => `form-input${errors[f] ? ' error' : ''}`

  return (
    <main className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>TaskFlow</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing your tasks today</p>

        {errors.form && (
          <div style={{
            background: 'var(--priority-high-bg)',
            color: 'var(--priority-high-color)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {errors.form}
          </div>
        )}

        <form id="register-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">name</label>
            <input id="reg-name" type="text" className={cls('name')}
              placeholder="johndoe" value={form.name} onChange={set('name')}
              disabled={loading} autoComplete="name" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className={cls('email')}
              placeholder="you@example.com" value={form.email} onChange={set('email')}
              disabled={loading} autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className={cls('password')}
              placeholder="Min. 6 characters" value={form.password} onChange={set('password')}
              disabled={loading} autoComplete="new-password" />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" className={cls('confirm')}
              placeholder="••••••••" value={form.confirm} onChange={set('confirm')}
              disabled={loading} autoComplete="new-password" />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button id="register-submit" type="submit"
            className="btn btn-primary w-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link href="/login" id="register-login-link">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
