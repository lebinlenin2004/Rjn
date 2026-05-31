import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Notice from '../components/Notice'
import { fetchProduct, fetchProducts } from '../lib/catalog'
import { formatPrice, hasPrice } from '../lib/price'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { session, supabaseReady } = useAuth()
  const [comment, setComment] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [related, setRelated] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    setLoading(true)
    setSelectedImageIndex(0)
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
    setFeedbackStatus({ type: 'info', text: 'Posting your review...' })
    const { error } = await supabase.from('feedback').insert({
      comment: comment.trim(),
      product_id: id,
      rating: Number(rating),
      user_id: session.user.id,
    })

    if (error) {
      setFeedbackStatus({ type: 'error', text: error.message })
      return
    }

    setComment('')
    setRating(5)
    setFeedbackStatus({ type: 'success', text: 'Thanks! Your review has been added.' })
    fetchProduct(id).then(setProduct)
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

  const images = product.image_urls?.length ? product.image_urls : [product.image_url || product.image || '/placeholder-product.svg']
  const image = images[selectedImageIndex] || images[0] || '/placeholder-product.svg'
  const price = formatPrice(product.price)
  const showPrice = hasPrice(product)
  const whatsappText = encodeURIComponent(`*NEW ORDER INQUIRY - RJN FOODS*\n\n*Product:* ${product.name}\n*Category:* ${product.category?.name || 'Kitchen'}${showPrice ? `\n*Price:* ${price}` : ''}\n\nHello! I am interested in this item. Is it available for delivery?\n\n_Sent from RJN Foods Website_`)
  const feedback = [...(product.feedback || [])].sort((first, second) => new Date(second.created_at) - new Date(first.created_at))
  const reviewCount = feedback.length
  const averageRating = Number(product.rating || 0)
  const ratingDistribution = [5, 4, 3, 2, 1].map((value) => {
    const count = feedback.filter((item) => Number(item.rating) === value).length
    return {
      count,
      percentage: reviewCount ? Math.round((count / reviewCount) * 100) : 0,
      value,
    }
  })

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-5">
          <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <li><Link to="/" className="hover:text-brand-500 transition-colors">Home</Link></li>
            <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[10px]"></i></li>
            <li><Link to="/products" className="hover:text-brand-500 transition-colors">{product.category?.name || 'Kitchen'}</Link></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[42%_1fr] gap-4 lg:gap-6 items-start">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-[72px_1fr] gap-4">
                <div className="space-y-3">
                  {images.map((thumb, index) => (
                    <button key={`${thumb}-${index}`} onClick={() => setSelectedImageIndex(index)} className={`w-[72px] h-[72px] rounded-xl border ${index === selectedImageIndex ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-100'} bg-white overflow-hidden p-1 hover:border-brand-400 transition-colors`} aria-label={`Show product image ${index + 1}`} type="button">
                      <img src={thumb} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={image} className="w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-105" alt={product.name} />
                </div>
              </div>
            </div>

            <div>
              <a href={`https://wa.me/9710509690664?text=${whatsappText}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-brand-900 text-brand-100 text-sm font-black rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 active:scale-[0.98]">
                <i className="fa-brands fa-whatsapp text-lg"></i>
                WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <TrustBadge icon="fa-shield-check" label="Verified" />
              <TrustBadge icon="fa-bolt" label="Fast Reply" />
              <TrustBadge icon="fa-lock" label="Secure" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="pb-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[11px] font-black uppercase tracking-widest">{product.category?.name || 'Kitchen'}</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest">{product.stock_status || 'available'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white rounded-md text-sm font-black">
                  {averageRating.toFixed(1)}
                  <i className="fa-solid fa-star text-[10px]"></i>
                </span>
                <span className="text-sm font-bold text-gray-500">{reviewCount} ratings and reviews</span>
                <span className="text-sm font-bold text-brand-600">RJN Assured</span>
              </div>
            </div>

            <div className="py-6 border-b border-gray-100">
              {showPrice ? (
                <div className="mb-2">
                  <p className="text-xs font-bold text-green-600 mb-1">Special price</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="text-4xl font-black text-gray-900">{price}</div>
                    <span className="text-sm font-bold text-gray-400 line-through">{formatPrice(Number(product.price || 0) * 1.12)}</span>
                    <span className="text-sm font-black text-green-600">12% off</span>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-black text-gray-900">Price on request</p>
              )}
              <p className="text-sm font-semibold text-gray-500">Minimum order quantity: {product.min_order_quantity || 1}</p>
            </div>

            <div className="py-6 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900 mb-4">Available offers</h2>
              <div className="space-y-3">
                <OfferItem title="Bulk order pricing" text="Contact the seller on WhatsApp for quantity-based rates." />
                <OfferItem title="Fast seller response" text="Most RJN sellers reply within minutes during business hours." />
                <OfferItem title="Fresh supply promise" text="Products are listed by verified suppliers with RJN quality checks." />
              </div>
            </div>

            <div className="py-6 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900 mb-4">Product details</h2>
              <div className="space-y-4">
                <InfoRow label="Description" value={product.description} />
                <InfoRow label="Category" value={product.category?.name || 'Kitchen'} />
                <InfoRow label="Stock" value={product.stock_status || 'Available'} />
              </div>
            </div>

            <div className="py-6 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900 mb-4">Delivery & order</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ServiceTile icon="fa-truck-fast" title="Delivery" text="Confirm location and timing with seller" />
                <ServiceTile icon="fa-rotate-left" title="Replacement" text="Discuss product condition on delivery" />
                <ServiceTile icon="fa-credit-card" title="Payment" text="Seller will confirm payment options" />
                <ServiceTile icon="fa-headset" title="Support" text="Order support through WhatsApp" />
              </div>
            </div>

            {product.show_seller !== false ? (
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-600 border border-gray-100">
                      <i className="fa-solid fa-shop text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Seller</p>
                      <p className="text-lg font-bold text-gray-900">{product.seller?.username || product.seller?.full_name || 'RJN Official'}</p>
                      <div className="flex items-center gap-1.5 text-brand-600 font-bold text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                        Verified Seller
                      </div>
                    </div>
                  </div>
                  <a href={`https://wa.me/9710509690664?text=${whatsappText}`} target="_blank" rel="noreferrer" className="px-5 py-3 bg-white text-gray-800 text-xs font-black rounded-xl border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-all text-center">Contact Seller</a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-2">Ratings & Feedback</p>
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              </div>
              <div className="px-4 py-2 bg-brand-50 rounded-full text-xs font-bold text-brand-700 border border-brand-100">{reviewCount} Reviews</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 mb-10">
              <div className="p-6 bg-gray-900 text-white rounded-3xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Average Rating</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-5xl font-black leading-none">{averageRating.toFixed(1)}</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">/ 5</span>
                </div>
                <div className="flex text-amber-300 text-sm mb-3">
                  <StarRow rating={averageRating} />
                </div>
                <p className="text-xs font-semibold text-gray-400">{reviewCount ? `Based on ${reviewCount} customer reviews` : 'No reviews yet'}</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="space-y-3">
                  {ratingDistribution.map((item) => (
                    <div key={item.value} className="grid grid-cols-[44px_1fr_36px] items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                        {item.value}<i className="fa-solid fa-star text-[10px] text-amber-400"></i>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {supabaseReady && session ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-10 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
                    <p className="text-sm text-gray-500 mt-1">Share your experience with this product.</p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 items-center justify-center">
                    <i className="fa-solid fa-message text-lg"></i>
                  </div>
                </div>
                <form onSubmit={submitFeedback} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Rating</label>
                    <div className="inline-flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = (hoverRating || rating) >= value
                        return (
                          <button key={value} type="button" onMouseEnter={() => setHoverRating(value)} onClick={() => setRating(value)} className={`w-11 h-11 rounded-xl text-xl transition-all ${active ? 'bg-amber-100 text-amber-500 shadow-sm' : 'bg-white text-gray-300 hover:text-amber-400'}`} aria-label={`${value} star rating`}>
                            <i className={`${active ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                          </button>
                        )
                      })}
                      <span className="pl-2 pr-3 text-sm font-bold text-gray-500">{rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Feedback</label>
                    <textarea className="rjn-input min-h-32 resize-none" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you like about this product?" required />
                  </div>
                  {feedbackStatus ? <FeedbackStatus status={feedbackStatus} /> : null}
                  <button type="submit" className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-brand-500 transition-all shadow-lg active:scale-95">
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <Notice><Link to="/auth" className="font-bold text-brand-600">Login</Link> with Supabase to add feedback.</Notice>
            )}

            <div className="space-y-4">
              {feedback.length ? feedback.map((item) => (
                <div key={item.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg border border-brand-100">
                      {(item.profiles?.full_name || 'B').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.profiles?.full_name || 'Buyer'}</h4>
                          <p className="text-xs font-semibold text-gray-400">{formatReviewDate(item.created_at)}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
                          <span className="text-xs font-black text-amber-600">{Number(item.rating).toFixed(1)}</span>
                          <div className="flex text-amber-400 text-[10px]">
                            <StarRow rating={Number(item.rating)} />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.comment}</p>
                    </div>
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
                    <p className="text-brand-600 font-bold text-base">{formatPrice(item.price)}</p>
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
    <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 transition-colors hover:shadow-md group">
      <div className="w-9 h-9 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-brand-600 group-hover:text-white transition-all">
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">{label}</p>
    </div>
  )
}

function OfferItem({ text, title }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
        <i className="fa-solid fa-tag text-xs"></i>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        <span className="font-black text-gray-900">{title}</span> - {text}
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 text-sm">
      <dt className="font-bold text-gray-400">{label}</dt>
      <dd className="font-semibold text-gray-700 leading-relaxed">{value}</dd>
    </div>
  )
}

function ServiceTile({ icon, text, title }) {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="w-10 h-10 bg-white text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm font-black text-gray-900">{title}</p>
        <p className="text-xs font-semibold text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function StarRow({ rating }) {
  return [1, 2, 3, 4, 5].map((star) => (
    <i key={star} className={`${Number(rating || 0) >= star ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
  ))
}

function FeedbackStatus({ status }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
  }

  return (
    <div className={`px-4 py-3 rounded-2xl border text-sm font-bold ${styles[status.type]}`}>
      {status.text}
    </div>
  )
}

function formatReviewDate(value) {
  if (!value) return 'Recently'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
