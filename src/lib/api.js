const fallbackApiBaseUrl = import.meta.env.PROD
  ? 'https://rjn-python.onrender.com/api'
  : 'http://localhost:8000/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl).replace(/\/$/, '')
const TOKEN_KEY = 'rjn_access_token'
const REFRESH_KEY = 'rjn_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens(tokens) {
  if (tokens?.access) localStorage.setItem(TOKEN_KEY, tokens.access)
  if (tokens?.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30000)

  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  let text
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, signal: controller.signal })
    text = await response.text()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The server is taking too long to respond. Please try again in a moment.')
    }
    throw new Error('Could not reach the server. Please check your connection and try again.')
  } finally {
    window.clearTimeout(timeout)
  }

  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      const contentType = response.headers.get('content-type') || 'unknown content type'
      throw new Error(`Backend returned ${response.status} ${contentType} for ${path}. Check Django terminal for the traceback.`)
    }
  }

  if (!response.ok) {
    const message = data?.detail || Object.values(data || {})?.flat?.()?.[0] || 'Request failed'
    throw new Error(message)
  }

  return data
}

export function getResults(payload) {
  return Array.isArray(payload) ? payload : payload?.results || []
}

export const authApi = {
  login: (email, password) => apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username: email, password }),
  }),
  register: (payload) => apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  verifyEmail: (token) => apiRequest(`/auth/verify-email/?token=${encodeURIComponent(token)}`),
  updateProfile: (payload) => apiRequest('/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  requestPasswordReset: (email) => apiRequest('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  confirmPasswordReset: (token, password) => apiRequest('/auth/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),
  me: () => apiRequest('/auth/me/'),
}

export const shopApi = {
  listCart: () => apiRequest('/cart/'),
  addCartItem: (productId, quantity = 1) => apiRequest('/cart/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  }),
  updateCartItem: (id, quantity) => apiRequest(`/cart/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  }),
  removeCartItem: (id) => apiRequest(`/cart/${id}/`, { method: 'DELETE' }),
  checkout: (payload) => apiRequest('/orders/checkout/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  listOrders: () => apiRequest('/orders/'),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/set_status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  submitInquiry: (payload) => apiRequest('/inquiries/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  submitFeedback: (payload) => apiRequest('/feedback/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  adminSummary: () => apiRequest('/admin/summary/'),
}
