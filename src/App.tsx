import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/common/Toast'
import AppLayout from './components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute'
import Analytics from './pages/Analytics'
import Budgets from './pages/Budgets'
import Calendar from './pages/Calendar'
import SavingsGoals from './pages/SavingsGoals'
import Settings from './pages/Settings'
import Transactions from './pages/Transactions'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import SetupNotice from './pages/SetupNotice'

// When someone opens a password-reset email link, send them to the reset form.
function RecoveryRedirect() {
  const { isRecovery } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (isRecovery) navigate('/reset-password', { replace: true })
  }, [isRecovery, navigate])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      {!isSupabaseConfigured ? (
        <SetupNotice />
      ) : (
        <ToastProvider>
          <AuthProvider>
            <HashRouter>
              <RecoveryRedirect />
              <Routes>
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="goals" element={<SavingsGoals />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </HashRouter>
          </AuthProvider>
        </ToastProvider>
      )}
    </ThemeProvider>
  )
}
