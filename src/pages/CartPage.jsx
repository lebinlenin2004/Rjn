import { Link } from 'react-router-dom'
import { shopApi } from '../lib/api'
import { formatPrice } from '../lib/price'
import { useAuth } from '../lib/useAuth'
import { useCart } from '../lib/useCart'
import { useState } from 'react'

export default function CartPage() {
  const cart = useCart()
  const { profile } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [status, setStatus] = useState(null)

  async function checkout(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setStatus({ type: 'info', text: 'Placing your order...' })
    try {
      const payload = Object.fromEntries(new FormData(formElement))
      await shopApi.checkout(payload)
      await cart.loadCart()
      setCheckoutOpen(false)
      setStatus({ type: 'success', text: 'Order placed successfully.' })
      formElement.reset()
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="py-12 bg-[#fffaf0] min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Cart</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Review quantities and place your order.</p>
          </div>
          <Link to="/orders" className="text-sm font-bold text-brand-600 hover:text-brand-700">View Orders</Link>
        </div>

        {status ? <StatusMessage status={status} /> : null}

        {cart.items.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 text-center">
            <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add products from the catalog to start an order.</p>
            <Link to="/products" className="inline-flex px-8 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm">
                  <img src={item.product.image_url || '/placeholder-product.svg'} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.id}`} className="font-black text-gray-900 hover:text-brand-600 line-clamp-1">{item.product.name}</Link>
                    <p className="text-xs font-bold text-gray-400 mt-1">{item.product.category?.name || 'Kitchen'}</p>
                    <p className="text-sm font-black text-brand-600 mt-3">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 rounded-xl bg-gray-100 font-black">-</button>
                      <span className="w-10 text-center font-black">{item.quantity}</span>
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 rounded-xl bg-gray-100 font-black">+</button>
                    </div>
                    <button onClick={() => cart.removeItem(item.id)} className="text-xs font-bold text-red-500 hover:text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-fit">
              <h2 className="text-lg font-black text-gray-900 mb-5">Order Summary</h2>
              <div className="flex justify-between text-sm font-bold text-gray-500 mb-3">
                <span>Items</span>
                <span>{cart.count}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900 border-t border-gray-100 pt-5 mb-6">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <button onClick={() => setCheckoutOpen((value) => !value)} className="w-full py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600">
                Checkout
              </button>

              {checkoutOpen ? (
                <form onSubmit={checkout} className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                  <Field name="full_name" label="Full Name" defaultValue={profile?.full_name || ''} required />
                  <Field name="email" label="Email" type="email" defaultValue={profile?.email || ''} required />
                  <Field name="phone" label="Phone" defaultValue={profile?.phone || ''} required />
                  <Field name="address" label="Delivery Address" defaultValue={profile?.address || ''} textarea required />
                  <Field name="notes" label="Order Notes" textarea />
                  <button className="w-full py-3 bg-brand-900 text-brand-100 font-bold rounded-2xl hover:bg-brand-800">Place Order</button>
                </form>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

function Field({ defaultValue = '', label, name, required, textarea = false, type = 'text' }) {
  const Control = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <Control className="rjn-input" defaultValue={defaultValue} name={name} required={required} type={textarea ? undefined : type} />
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
