import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AuthPage from '../pages/AuthPage'
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import ExplorePage from '../pages/ExplorePage'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'

export default function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
