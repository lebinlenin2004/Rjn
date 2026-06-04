import { useEffect, useState } from 'react'
import { shopApi } from '../lib/api'
import { formatPrice } from '../lib/price'

export default function AdminPage() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    shopApi.adminSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
  }, [])

  async function updateOrderStatus(orderId, status) {
    setStatusMessage('Updating order...')
    try {
      const updated = await shopApi.updateOrderStatus(orderId, status)
      setSummary((current) => ({
        ...current,
        recent_orders: current.recent_orders.map((order) => (order.id === updated.id ? updated : order)),
      }))
      setStatusMessage('Order status updated.')
    } catch (err) {
      setStatusMessage(err.message)
    }
  }

  if (error) {
    return (
      <section className="py-20 bg-white min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-3">Admin Access Required</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </section>
    )
  }

  if (!summary) return <section className="py-12 bg-white"><div className="max-w-6xl mx-auto px-4 text-gray-500">Loading admin dashboard...</div></section>

  return (
    <section className="py-12 bg-[#fffaf0] min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-sm font-semibold text-gray-500 mb-8">Store health, sales, orders, and catalog activity.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Stat label="Products" value={summary.products} />
          <Stat label="Active" value={summary.active_products} />
          <Stat label="Orders" value={summary.orders} />
          <Stat label="Sales" value={formatPrice(summary.total_sales)} />
          <Stat label="Pending Orders" value={summary.pending_orders} />
          <Stat label="Customers" value={summary.customers} />
          <Stat label="Inquiries" value={summary.inquiries} />
        </div>

        {statusMessage ? <div className="mb-6 p-4 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-600">{statusMessage}</div> : null}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.recent_orders.map((order) => (
              <div key={order.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="font-black text-gray-900">#{order.id} - {order.full_name}</p>
                  <p className="text-xs font-bold text-gray-400">{order.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="px-3 py-2 bg-brand-50 text-brand-700 rounded-xl text-xs font-black uppercase border border-brand-100">
                    {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <span className="font-black text-brand-600">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            ))}
            {summary.recent_orders.length === 0 ? <div className="px-6 py-10 text-sm font-bold text-gray-400 text-center">No orders yet.</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  )
}
