import Sidebar from '../components/Sidebar'
import SharingPanel from '../components/SharingPanel'
import { useEffect, useState } from 'react'
import { fetchMe } from '../auth'
import type { User } from '../api'

export default function SharingPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchMe().then(setUser).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={[]} selectedPersonId={null} onSelectPerson={() => {}} activePage="sharing" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <SharingPanel />
      </div>
    </div>
  )
}
