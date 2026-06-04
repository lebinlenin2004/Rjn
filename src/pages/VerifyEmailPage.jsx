import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState({ type: 'info', text: 'Verifying your email...' })

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus({ type: 'error', text: 'Verification token is missing.' })
      return
    }

    authApi.verifyEmail(token)
      .then((data) => setStatus({ type: 'success', text: data.detail || 'Email verified. You can login now.' }))
      .catch((error) => setStatus({ type: 'error', text: error.message }))
  }, [searchParams])

  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
        <img src="/rjn-logo.png" alt="RJN logo" className="w-16 h-16 bg-brand-900 rounded-full object-contain p-2 mx-auto mb-6 border border-brand-300 shadow-sm" />
        <h1 className="text-2xl font-black text-gray-900 mb-4">Email Verification</h1>
        <div className={`p-4 rounded-2xl border text-sm font-bold mb-6 ${styles[status.type]}`}>
          {status.text}
        </div>
        <Link to="/auth" className="inline-flex px-6 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600">
          Go to Login
        </Link>
      </div>
    </section>
  )
}
