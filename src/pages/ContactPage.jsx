import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ContactPage({ bulk = false }) {
  return bulk ? <BulkOrderPage /> : <GeneralContactPage />
}

function GeneralContactPage() {
  const [status, setStatus] = useState(null)

  async function submit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setStatus({ type: 'info', text: 'Sending your message...' })

    if (supabase) {
      const { error } = await supabase.from('bulk_inquiries').insert({ ...data, company: data.subject, message: data.message })
      if (error) {
        setStatus({ type: 'error', text: error.message })
        return
      }
    }

    setStatus({ type: 'success', text: 'Message sent successfully. We will contact you soon.' })
    event.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Get in <span className="text-brand-500">Touch</span>
          </h1>
          <p className="text-lg text-gray-600">Have a question or feedback? We&apos;d love to hear from you.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-500/5 border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            {status ? <StatusMessage status={status} /> : null}
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Phone (Optional)" name="phone" />
                <Field label="Subject" name="subject" required />
              </div>
              <Field label="Message" name="message" textarea required />
              <div className="pt-4">
                <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
                  <span>Send Message</span>
                  <i className="fa-solid fa-paper-plane text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <Info icon="fa-envelope" title="Email Us" text="rjnfoods@gmail.com" />
          <Info icon="fa-phone" title="Call Us" text="0509690664" />
          <Info icon="fa-location-dot" title="Visit Us" text="123 Market St, City" />
        </div>
      </div>
    </div>
  )
}

function BulkOrderPage() {
  const [status, setStatus] = useState(null)

  async function submit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setStatus({ type: 'info', text: 'Sending your bulk order request...' })

    if (supabase) {
      const { error } = await supabase.from('bulk_inquiries').insert({
        company: data.company_name,
        email: data.email,
        message: `${data.products_interest}\n\n${data.additional_notes || ''}`,
        name: data.name,
        phone: data.phone,
      })
      if (error) {
        setStatus({ type: 'error', text: error.message })
        return
      }
    }

    setStatus({ type: 'success', text: 'Your bulk order request was submitted. Our team will contact you soon.' })
    event.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Business Solutions</span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Bulk <span className="text-brand-500">Orders</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Looking to order in quantity? Fill out the form below and our team will get back to you with a custom quote.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-500/5 border border-gray-100 p-8 sm:p-10">
              {status ? <StatusMessage status={status} /> : null}
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Contact Name" name="name" required />
                  <Field label="Business Email" name="email" type="email" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Phone Number" name="phone" />
                  <Field label="Company Name" name="company_name" />
                </div>
                <Field label="Products & Quantities" name="products_interest" textarea required hint="Please list the items you're interested in and approximate quantities." />
                <Field label="Additional Requirements" name="additional_notes" textarea />
                <div className="pt-4">
                  <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
                    <span>Request Quote</span>
                    <i className="fa-solid fa-file-invoice-dollar text-sm group-hover:scale-110 transition-transform"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-500/20">
              <h3 className="text-xl font-bold mb-4">Why Bulk Order?</h3>
              <ul className="space-y-4">
                {['Special Volume Pricing', 'Priority Shipping', 'Dedicated Account Manager', 'Custom Packaging Options'].map((item) => (
                  <li className="flex gap-3" key={item}>
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-500 mb-6">If you have urgent questions about bulk ordering, feel free to contact our sales team directly.</p>
              <a href="mailto:sales@rjn.com" className="flex items-center gap-3 text-brand-600 font-bold hover:gap-4 transition-all group">
                <span>sales@rjn.com</span>
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ hint, label, name, required, textarea = false, type = 'text' }) {
  const Control = textarea ? 'textarea' : 'input'
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <Control className="rjn-input" name={name} required={required} type={textarea ? undefined : type} />
      {hint ? <p className="text-[10px] text-gray-400 ml-1 italic">{hint}</p> : null}
    </div>
  )
}

function Info({ icon, text, title }) {
  return (
    <div className="p-6">
      <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}

function StatusMessage({ status }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
  }
  const icon = {
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info',
    success: 'fa-circle-check',
  }

  return (
    <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border mb-6 ${styles[status.type]}`}>
      <i className={`fa-solid ${icon[status.type]}`}></i>
      {status.text}
    </div>
  )
}
