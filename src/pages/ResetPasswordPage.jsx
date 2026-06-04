import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const token = searchParams.get('token') || ''

  async function submit(event) {
    event.preventDefault()
    setStatus({ type: 'info', text: 'Updating password...' })
    try {
      const data = await authApi.confirmPasswordReset(token, password)
      setStatus({ type: 'success', text: data.detail || 'Password reset successfully.' })
      setPassword('')
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src="/rjn-logo.png" alt="RJN logo" className="w-16 h-16 bg-brand-900 rounded-full object-contain p-2 mx-auto mb-6 border border-brand-300 shadow-sm" />
          <h1 className="text-2xl font-black text-gray-900">Reset Password</h1>
          <p className="text-sm font-semibold text-gray-500 mt-2">Enter a new password for your RJN account.</p>
        </div>
        {status ? <StatusMessage status={status} /> : null}
        {!token ? (
          <StatusMessage status={{ type: 'error', text: 'Password reset token is missing. Request a new reset link.' }} />
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">New Password</label>
              <input id="new-password" className="rjn-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </div>
            <button className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20">
              Update Password
            </button>
          </form>
        )}
        <div className="text-center mt-8">
          <Link to="/auth" className="text-sm font-bold text-brand-600 hover:text-brand-700">Back to Login</Link>
        </div>
      </div>
    </section>
  )
}

function StatusMessage({ status }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
  }
  return <div className={`p-4 rounded-2xl border text-sm font-bold mb-5 ${styles[status.type]}`}>{status.text}</div>
}
