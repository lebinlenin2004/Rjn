import { useEffect, useState } from 'react'
import { authApi } from '../lib/api'
import { useAuth } from '../lib/useAuth'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ address: '', full_name: '', phone: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!profile) return
    setForm({
      address: profile.address || '',
      full_name: profile.full_name || '',
      phone: profile.phone || '',
    })
  }, [profile])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setStatus({ type: 'info', text: 'Saving profile...' })
    try {
      await authApi.updateProfile(form)
      await refreshProfile()
      setStatus({ type: 'success', text: 'Profile updated.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="py-12 bg-[#fffaf0] min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-2">My Account</p>
          <h1 className="text-3xl font-black text-gray-900">Profile</h1>
          <p className="text-sm font-semibold text-gray-500 mt-2">Manage your delivery and contact information.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <aside className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
            <div className="w-16 h-16 rounded-2xl bg-brand-900 text-brand-100 flex items-center justify-center text-2xl font-black mb-5">
              {(profile?.full_name || profile?.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <h2 className="font-black text-gray-900 text-xl break-words">{profile?.full_name || 'RJN Customer'}</h2>
            <p className="text-sm font-semibold text-gray-500 break-words mt-1">{profile?.email}</p>
            <div className="mt-5 inline-flex px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-black uppercase tracking-widest">
              {profile?.role || 'buyer'}
            </div>
          </aside>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            {status ? <StatusMessage status={status} /> : null}
            <form onSubmit={submit} className="space-y-6">
              <Field label="Full Name" name="full_name" value={form.full_name} onChange={updateField} />
              <Field label="Phone Number" name="phone" value={form.phone} onChange={updateField} />
              <Field label="Address" name="address" value={form.address} onChange={updateField} textarea />
              <button className="w-full sm:w-auto px-8 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20">
                Save Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, name, onChange, textarea = false, value }) {
  const Control = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label htmlFor={`profile-${name}`} className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">{label}</label>
      <Control id={`profile-${name}`} className="rjn-input" name={name} value={value} onChange={onChange} />
    </div>
  )
}

function StatusMessage({ status }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
  }
  return <div className={`p-4 rounded-2xl border text-sm font-bold mb-6 ${styles[status.type]}`}>{status.text}</div>
}
