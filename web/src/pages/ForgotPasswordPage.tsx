import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await api.post('/auth/forgot-password', { email })
      setMessage(r.data.data.message)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20, padding: '44px 40px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(30,45,80,0.14)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #34c9ba, #22a99c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(52,201,186,0.35)', fontSize: 24 }}>🛡️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#15203a', margin: 0 }}>Reset your password</h1>
          <p style={{ color: '#8a9ab5', fontSize: 13, marginTop: 4 }}>Enter your account email and we'll send you a reset link</p>
        </div>

        {message ? (
          <div style={{ background: 'rgba(52,201,186,0.1)', border: '1px solid rgba(52,201,186,0.25)', borderRadius: 8, padding: '14px', fontSize: 13, color: '#15203a', textAlign: 'center' }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, fontSize: 15, color: '#15203a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c53030', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: loading ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9ab5', marginTop: 20, marginBottom: 0 }}>
          <Link to="/login" style={{ color: '#34c9ba', fontWeight: 700, textDecoration: 'none' }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
