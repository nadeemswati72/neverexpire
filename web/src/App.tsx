import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './auth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import AddDocumentPage from './pages/AddDocumentPage'
import FamilyPage from './pages/FamilyPage'
import SharingPage from './pages/SharingPage'
import MockInboxPage from './pages/MockInboxPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
      <Route path="/documents/add" element={<RequireAuth><AddDocumentPage /></RequireAuth>} />
      <Route path="/documents/:id" element={<RequireAuth><DocumentDetailPage /></RequireAuth>} />
      <Route path="/family" element={<RequireAuth><FamilyPage /></RequireAuth>} />
      <Route path="/sharing" element={<RequireAuth><SharingPage /></RequireAuth>} />
      <Route path="/mock-inbox" element={<RequireAuth><MockInboxPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
