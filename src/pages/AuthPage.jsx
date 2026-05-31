import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Notice from '../components/Notice'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const { session, supabaseReady } = useAuth()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState(getAuthMode(searchParams))
  const [password, setPassword] = useState('')

  useEffect(() => {
    setMode(getAuthMode(searchParams))
  }, [searchParams])

  async function submit(event) {
    event.preventDefault()
    setMessage('')

    let response

    if (mode === 'login') {
      response = await supabase.auth.signInWithPassword({ email, password })
    } else if (mode === 'signup') {
      response = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    } else if (mode === 'forgot-password') {
      response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      })
    } else {
      response = await supabase.auth.updateUser({ password })
    }

    if (response.error) setMessage(response.error.message)
    else {
      const successMessage = {
        login: 'Logged in successfully.',
        signup: 'Check your email to confirm your account.',
        'forgot-password': 'Password reset link sent. Please check your email.',
        'reset-password': 'Password updated successfully. You can continue using your account.',
      }[mode]
      setMessage(successMessage)
    }
  }

  if (!supabaseReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
        <div className="w-full max-w-md">
          <Notice>
            Create a Supabase project, run <code>supabase/schema.sql</code>, then add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>.
          </Notice>
        </div>
      </div>
    )
  }

  if (session && mode !== 'reset-password') {
    return <Navigate to="/" replace />
  }

  const isSignup = mode === 'signup'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className={`w-full ${isSignup ? 'max-w-lg' : 'max-w-md'} bg-white rounded-3xl shadow-sm border border-gray-100 p-10 animate-fade-in`}>
        <div className="text-center mb-10">
          <img src="/rjn-logo.png" alt="RJN logo" className="w-20 h-20 bg-brand-900 rounded-full object-contain p-2 mx-auto mb-6 border border-brand-300 shadow-sm" />
          <h2 className="text-3xl font-black text-gray-900 mb-2">{getTitle(mode)}</h2>
          <p className="text-gray-500 font-medium">{getDescription(mode)}</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {isSignup ? (
            <AuthField label="Full name" value={fullName} onChange={setFullName} required />
          ) : null}
          {!isResetPassword ? (
            <AuthField label="Email" type="email" value={email} onChange={setEmail} required />
          ) : null}
          {!isForgotPassword ? (
            <AuthField label={isResetPassword ? 'New Password' : 'Password'} type="password" value={password} onChange={setPassword} required />
          ) : null}

          <button type="submit" className="w-full py-4 mt-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 active:scale-[0.98]">
            {getSubmitLabel(mode)}
          </button>
          {mode === 'login' ? (
            <div className="text-center mt-4">
              <Link to="/auth?mode=forgot-password" className="text-sm text-gray-400 font-bold hover:text-brand-600 transition-colors">Forgot Password?</Link>
            </div>
          ) : null}
        </form>

        {message ? <p className="text-center text-sm font-bold text-gray-500 mt-6">{message}</p> : null}

        <div className="text-center mt-8 pt-8 border-t border-gray-50">
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <Link to={mode === 'signup' ? '/auth' : isResetPassword || isForgotPassword ? '/auth' : '/auth?mode=signup'} className="text-brand-600 font-bold hover:text-brand-700 transition-colors ml-1">
              {mode === 'signup' || isResetPassword || isForgotPassword ? 'Login here' : 'Create Account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function getAuthMode(searchParams) {
  const mode = searchParams.get('mode')
  if (['signup', 'forgot-password', 'reset-password'].includes(mode)) return mode
  return 'login'
}

function getTitle(mode) {
  return {
    login: 'Welcome Back',
    signup: 'Create Account',
    'forgot-password': 'Reset Password',
    'reset-password': 'Set New Password',
  }[mode]
}

function getDescription(mode) {
  return {
    login: 'Login to manage your store and profile',
    signup: 'Join RJN and start managing your products',
    'forgot-password': 'Enter your email and we will send a reset link',
    'reset-password': 'Enter a new password for your account',
  }[mode]
}

function getSubmitLabel(mode) {
  return {
    login: 'Login to Account',
    signup: 'Create My Account',
    'forgot-password': 'Send Reset Link',
    'reset-password': 'Update Password',
  }[mode]
}

function AuthField({ label, onChange, required, type = 'text', value }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">{label}</label>
      <input className="rjn-input" value={value} onChange={(event) => onChange(event.target.value)} type={type} required={required} minLength={type === 'password' ? 6 : undefined} />
    </div>
  )
}
