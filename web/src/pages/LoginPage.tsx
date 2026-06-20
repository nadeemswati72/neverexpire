import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)',
      padding: '20px',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,201,186,0.18) 0%, transparent 70%)',
          top: '10%', left: '10%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,80,0.12) 0%, transparent 70%)',
          bottom: '15%', right: '15%', filter: 'blur(40px)',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 8px 32px rgba(30,45,80,0.14)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #34c9ba, #22a99c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(52,201,186,0.35)',
            fontSize: 24,
          }}>⏰</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15203a', margin: 0 }}>NeverExpire</h1>
          <p style={{ color: '#8a9ab5', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(30,45,80,0.15)',
                borderRadius: 10, fontSize: 15, color: '#15203a',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#34c9ba')}
              onBlur={e => (e.target.style.borderColor = 'rgba(30,45,80,0.15)')}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(30,45,80,0.15)',
                borderRadius: 10, fontSize: 15, color: '#15203a',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#34c9ba')}
              onBlur={e => (e.target.style.borderColor = 'rgba(30,45,80,0.15)')}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: '#c53030', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(52,201,186,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Forgot password */}
        <p style={{ textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
          <button
            type="button"
            onClick={() => alert('Password reset is not available in the demo version.\nPlease contact your administrator.')}
            style={{ background: 'none', border: 'none', color: '#8a9ab5', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot password?
          </button>
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(30,45,80,0.1)' }} />
          <span style={{ fontSize: 12, color: '#8a9ab5' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(30,45,80,0.1)' }} />
        </div>

        {/* Register link */}
        <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', border: '1.5px solid #34c9ba', borderRadius: 10, color: '#34c9ba', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          Create new account
        </Link>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9ab5', marginTop: 20 }}>
          Demo: <strong style={{ color: '#4a5568' }}>alice@neverexpire.test</strong> / <strong style={{ color: '#4a5568' }}>Demo@1234</strong>
        </p>
      </div>
    </div>
  )
}
