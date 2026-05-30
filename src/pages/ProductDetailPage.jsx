import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Notice from '../components/Notice'
import { fetchProduct, fetchProducts } from '../lib/catalog'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { session, supabaseReady } = useAuth()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [related, setRelated] = useState([])

  useEffect(() => {
    setLoading(true)
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
    fetchProducts()
      .then((items) => setRelated(items.filter((item) => item.id !== id).slice(0, 4)))
      .catch(() => setRelated([]))
  }, [id])

  async function submitFeedback(event) {
    event.preventDefault()
    if (!session || !supabase) return
    const { error } = await supabase.from('feedback').insert({
      comment,
      product_id: id,
      rating: Number(rating),
      user_id: session.user.id,
    })
    if (!error) {
      setComment('')
      fetchProduct(id).then(setProduct)
    }
  }

  if (loading) return <section className="py-12 bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-500">Loading product...</div></section>
  if (!product) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Product not found</h1>
          <p className="text-gray-500 mb-8">This item is unavailable or has been removed.</p>
          <Link to="/products" className="inline-flex items-center px-8 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
            Back to Products
          </Link>
        </div>
      </section>
    )
  }

  const image = product.image_url || product.image || '/placeholder-product.svg'
  const price = `AUED ${product.price}`
  const whatsappText = encodeURIComponent(`*NEW ORDER INQUIRY - RJN STORE*\n\n*Product:* ${product.name}\n*Category:* ${product.category?.name || 'Kitchen'}${product.show_price !== false ? `\n*Price:* ${price}` : ''}\n\nHello! I am interested in this item. Is it available for delivery?\n\n_Sent from RJN Store Website_`)

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <li><Link to="/" className="hover:text-brand-500 transition-colors">Home</Link></li>
            <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[10px]"></i></li>
            <li><Link to="/products" className="hover:text-brand-500 transition-colors">{product.category?.name || 'Kitchen'}</Link></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <img src={image} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={product.name} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TrustBadge icon="fa-shield-check" label="Verified Seller" />
              <TrustBadge icon="fa-bolt" label="Fast Response" />
              <TrustBadge icon="fa-lock" label="Secure Order" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                {product.show_price !== false ? (
                  <>
                    <div className="text-3xl font-bold text-brand-600">{price}</div>
                    <div className="h-6 w-px bg-gray-200"></div>
                  </>
                ) : null}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => <i key={star} className={`${Number(product.rating || 0) >= star ? 'fa-solid' : 'fa-regular'} fa-star`}></i>)}
                  </div>
                  <span className="text-sm font-semibold text-gray-400">({Number(product.rating || 0).toFixed(1)})</span>
                </div>
              </div>
              <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              <a href={`https://wa.me/9710509690664?text=${whatsappText}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-brand-900 text-brand-100 text-lg font-bold rounded-2xl hover:bg-brand-800 transition-all duration-300 shadow-xl shadow-brand-900/20 active:scale-[0.98]">
                <i className="fa-brands fa-whatsapp text-2xl"></i>
                Order via WhatsApp
              </a>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-brand-300 rounded-full animate-pulse"></span>
                Seller typically responds within minutes
              </div>
            </div>

            {product.show_seller !== false ? (
              <div className="mt-auto p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-500 border border-gray-100">
                      <i className="fa-solid fa-shop text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Posted by</p>
                      <p className="text-lg font-bold text-gray-900">{product.seller?.username || product.seller?.full_name || 'RJN Official'}</p>
                      <div className="flex items-center gap-1.5 text-brand-600 font-bold text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                        Verified Seller
                      </div>
                    </div>
                  </div>
                  <a href="#" className="px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">View Store</a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{product.feedback?.length || 0} Reviews</div>
            </div>

            {supabaseReady && session ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-10 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h3>
                <form onSubmit={submitFeedback} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Rating</label>
                    <select value={rating} onChange={(event) => setRating(event.target.value)} className="rjn-input">
                      {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Feedback</label>
                    <textarea className="rjn-input" value={comment} onChange={(event) => setComment(event.target.value)} required />
                  </div>
                  <button type="submit" className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-brand-500 transition-all shadow-lg active:scale-95">Submit Review</button>
                </form>
              </div>
            ) : (
              <Notice><Link to="/auth" className="font-bold text-brand-600">Login</Link> with Supabase to add feedback.</Notice>
            )}

            <div className="space-y-8">
              {product.feedback?.length ? product.feedback.map((feedback) => (
                <div key={feedback.id} className="flex gap-6 pb-8 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg border border-brand-100">
                    {(feedback.profiles?.full_name || 'B').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{feedback.profiles?.full_name || 'Buyer'}</h4>
                    </div>
                    <div className="flex text-amber-400 text-[10px] mb-3">
                      {[1, 2, 3, 4, 5].map((star) => <i key={star} className={`${feedback.rating >= star ? 'fa-solid' : 'fa-regular'} fa-star`}></i>)}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{feedback.comment}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-sm">
                    <i className="fa-solid fa-comments text-2xl"></i>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-8">Related Items</h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Link key={item.id} to={`/products/${item.id}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.image_url || '/placeholder-product.svg'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate mb-1 group-hover:text-brand-500 transition-colors">{item.name}</h4>
                    <p className="text-brand-600 font-bold text-base">AUED {item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBadge({ icon, label }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-white hover:shadow-md group">
      <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-500 group-hover:text-white transition-all">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">{label}</p>
    </div>
  )
}
