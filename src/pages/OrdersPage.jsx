import { useEffect, useState } from 'react'
import { getResults, shopApi } from '../lib/api'
import { formatPrice } from '../lib/price'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    shopApi.listOrders()
      .then((payload) => setOrders(getResults(payload)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 bg-white min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Orders</h1>
        <p className="text-sm font-semibold text-gray-500 mb-8">Track recent RJN orders and their current status.</p>

        {loading ? <p className="text-sm font-bold text-gray-400">Loading orders...</p> : null}
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-black text-gray-900">Order #{order.id}</h2>
                  <p className="text-xs font-bold text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-black uppercase">{order.status}</span>
                  <span className="font-black text-brand-600">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.product_image || '/placeholder-product.svg'} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                    <span className="font-bold text-gray-800 flex-1">{item.product_name}</span>
                    <span className="font-bold text-gray-400">x{item.quantity}</span>
                    <span className="font-black text-gray-900">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
          {!loading && orders.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <h2 className="text-lg font-black text-gray-900">No orders yet</h2>
              <p className="text-gray-500 mt-2">Checkout from your cart to create your first order.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
