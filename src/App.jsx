import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { useAuth } from './lib/useAuth'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <main className="page"><p>Checking your session...</p></main>
  if (!session) return <Navigate to="/auth" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="bulk-order" element={<ContactPage bulk />} />
        <Route path="auth" element={<AuthPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
