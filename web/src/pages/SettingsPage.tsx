import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import PasswordField from '../components/PasswordField'
import api, { type Person, type User } from '../api'
import { fetchMe } from '../auth'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([fetchMe(), api.get('/family')]).then(([me, fam]) => {
      setUser(me)
      setFamily(fam.data.data)
    })
  }, [])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setError('New password and confirmation do not match.'); return }

    setLoading(true)
    try {
      await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      setMessage('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)' }}>
      <Sidebar user={user} family={family} selectedPersonId={selectedPersonId} onSelectPerson={setSelectedPersonId} activePage="settings" />

      <div style={{ flex: 1, padding: '32px 28px', maxWidth: 480 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15203a', margin: '0 0 20px' }}>Settings</h1>

        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 20, padding: '28px 26px', boxShadow: '0 8px 32px rgba(30,45,80,0.1)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#15203a', margin: '0 0 16px' }}>Change Password</h2>

          <form onSubmit={handleSubmit}>
            <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordField label="New password" value={newPassword} onChange={setNewPassword} />
            <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} />

            {message && (
              <div style={{ background: 'rgba(52,201,186,0.1)', border: '1px solid rgba(52,201,186,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15203a', marginBottom: 16 }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c53030', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: loading ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
