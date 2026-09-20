import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppShell from '../components/common/AppShell'
import { LoginPage, RegisterPage } from '../pages/AuthPages'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import { BanksPage, CardsPage, BudgetsPage, ReportsPage, SettingsPage } from '../pages/FinancePages'

function Protected() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppShell><Outlet /></AppShell> : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<Protected />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/banks" element={<BanksPage />} />
      <Route path="/cards" element={<CardsPage />} />
      <Route path="/budgets" element={<BudgetsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
