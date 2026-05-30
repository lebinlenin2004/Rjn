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
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [password, setPassword] = useState('')

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  }, [searchParams])

  async function submit(event) {
    event.preventDefault()
    setMessage('')

    const response = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

    if (response.error) setMessage(response.error.message)
    else setMessage(mode === 'login' ? 'Logged in successfully.' : 'Check your email to confirm your account.')
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

  if (session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className={`w-full ${mode === 'signup' ? 'max-w-lg' : 'max-w-md'} bg-white rounded-3xl shadow-sm border border-gray-100 p-10 animate-fade-in`}>
        <div className="text-center mb-10">
          <img src="/rjn-logo.png" alt="RJN logo" className="w-20 h-20 bg-brand-900 rounded-full object-contain p-2 mx-auto mb-6 border border-brand-300 shadow-sm" />
          <h2 className="text-3xl font-black text-gray-900 mb-2">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-gray-500 font-medium">{mode === 'signup' ? 'Join RJN and start managing your products' : 'Login to manage your store and profile'}</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {mode === 'signup' ? (
            <AuthField label="Full name" value={fullName} onChange={setFullName} required />
          ) : null}
          <AuthField label="Email" type="email" value={email} onChange={setEmail} required />
          <AuthField label="Password" type="password" value={password} onChange={setPassword} required />

          <button type="submit" className="w-full py-4 mt-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 active:scale-[0.98]">
            {mode === 'signup' ? 'Create My Account' : 'Login to Account'}
          </button>
          {mode === 'login' ? (
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-gray-400 font-bold hover:text-brand-600 transition-colors">Forgot Password?</a>
            </div>
          ) : null}
        </form>

        {message ? <p className="text-center text-sm font-bold text-gray-500 mt-6">{message}</p> : null}

        <div className="text-center mt-8 pt-8 border-t border-gray-50">
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <Link to={mode === 'signup' ? '/auth' : '/auth?mode=signup'} className="text-brand-600 font-bold hover:text-brand-700 transition-colors ml-1">
              {mode === 'signup' ? 'Login here' : 'Create Account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function AuthField({ label, onChange, required, type = 'text', value }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">{label}</label>
      <input className="rjn-input" value={value} onChange={(event) => onChange(event.target.value)} type={type} required={required} minLength={type === 'password' ? 6 : undefined} />
    </div>
  )
}
