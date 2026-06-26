'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim())    e.email    = 'Email is required.'
    if (!password)        e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setErrors({})
    try {
      await login(email.trim(), password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>TaskFlow</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

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

        <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`form-input${errors.password ? ' error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account?{' '}
          <Link href="/register" id="login-register-link">Create one</Link>
        </p>
      </div>
    </main>
  )
}
