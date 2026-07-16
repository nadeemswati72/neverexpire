import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !email.trim() || !password) { setError('All fields are required.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await register(email, password, fullName)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const inp = (id: string, label: string, value: string, setter: (v: string) => void, type = 'text') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>{label}</label>
      <input
        id={id} type={type} value={value} onChange={e => setter(e.target.value)} required
        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, fontSize: 15, color: '#15203a', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = '#34c9ba')}
        onBlur={e => (e.target.style.borderColor = 'rgba(30,45,80,0.15)')}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,201,186,0.18) 0%, transparent 70%)', top: '5%', left: '5%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,80,0.12) 0%, transparent 70%)', bottom: '10%', right: '10%', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20, padding: '44px 40px', width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(30,45,80,0.14)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #34c9ba, #22a99c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(52,201,186,0.35)', fontSize: 24 }}>⏰</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15203a', margin: 0 }}>Create Account</h1>
          <p style={{ color: '#8a9ab5', fontSize: 14, marginTop: 4 }}>Join NeverExpire today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {inp('name', 'Full Name', fullName, setFullName)}
          {inp('email', 'Email Address', email, setEmail, 'email')}
          {inp('password', 'Password', password, setPassword, 'password')}
          {inp('confirm', 'Confirm Password', confirm, setConfirm, 'password')}

          {error && (
            <div style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c53030', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(52,201,186,0.4)' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(30,45,80,0.1)' }} />
          <span style={{ fontSize: 12, color: '#8a9ab5' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(30,45,80,0.1)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9ab5', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#34c9ba', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#8a9ab5', marginTop: 16, marginBottom: 0, lineHeight: 1.5 }}>
          NeverExpire is currently a private beta. We store your family's document details (names, dates, ID/document numbers, and any photos you upload) only to track expiry and enable the sharing features you choose to use — never sold or shared beyond that.
        </p>
      </div>
    </div>
  )
}
