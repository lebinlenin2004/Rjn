import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './lib/CartContext'
import { AuthProvider } from './lib/AuthContext'
import { useAuth } from './lib/useAuth'
import AdminPage from './pages/AdminPage'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import CartPage from './pages/CartPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

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
          <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="bulk-order" element={<ContactPage bulk />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
