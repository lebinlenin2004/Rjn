import { Link } from 'react-router-dom'
import { formatPrice, hasPrice } from '../lib/price'
import { useCart } from '../lib/useCart'
import { useAuth } from '../lib/useAuth'

export default function ProductCard({ compact = false, product }) {
  const { session } = useAuth()
  const cart = useCart()
  const price = formatPrice(product.price)
  const showPrice = hasPrice(product)
  const whatsappText = encodeURIComponent(`*NEW ORDER INQUIRY - RJN FOODS*\n\n*Product:* ${product.name}\n*Category:* ${product.category?.name || 'Kitchen'}${showPrice ? `\n*Price:* ${price}` : ''}\n\nHello! I would like to order this item. Is it available?\n\n_Sent from RJN Foods Website_`)
  const image = product.image_url || product.image || '/placeholder-product.svg'

  async function addToCart(event) {
    event.preventDefault()
    event.stopPropagation()
    if (!session) {
      window.location.href = '/auth'
      return
    }
    await cart.addToCart(product.id, product.min_order_quantity || 1)
  }

  return (
    <div className={`group relative flex flex-col bg-white ${compact ? 'rounded-2xl p-3 hover:shadow-xl hover:-translate-y-1 duration-300' : 'rounded-3xl p-3 hover:shadow-2xl hover:-translate-y-2 duration-500'} border border-gray-100 shadow-sm transition-all`}>
      <div className={`${compact ? 'rounded-xl mb-4' : 'rounded-2xl mb-5'} aspect-square overflow-hidden bg-gray-50 relative`}>
        {image ? (
          <img src={image} alt={product.name} className={`${compact ? 'duration-500' : 'duration-700'} w-full h-full object-cover transition-transform group-hover:scale-110`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <i className="fa-solid fa-image text-3xl"></i>
          </div>
        )}

        <div className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3 translate-y-2 group-hover:translate-y-0'} opacity-0 group-hover:opacity-100 transition-all z-20`}>
          <button className={`${compact ? 'w-8 h-8 rounded-full' : 'w-10 h-10 rounded-xl'} bg-white/90 backdrop-blur flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors`}>
            <i className="fa-regular fa-heart"></i>
          </button>
        </div>

        <Link to={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={product.name}></Link>
      </div>

      <div className={`${compact ? 'px-2 pb-2' : 'px-1 pb-1'} flex-1 flex flex-col`}>
        <div className="flex-1">
          <div className={`flex ${compact ? 'justify-between items-start mb-1' : 'items-center justify-between mb-2'}`}>
            <span className={`${compact ? 'text-[10px] font-bold text-brand-600 uppercase tracking-widest' : 'text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-md'}`}>
              {product.category?.name || 'Kitchen'}
            </span>
            <div className="flex items-center gap-1">
              <i className="fa-solid fa-star text-[10px] text-yellow-400"></i>
              <span className="text-[10px] font-black text-gray-400">{Number(product.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          <h3 className={`${compact ? 'font-semibold' : 'font-bold'} text-gray-900 text-sm line-clamp-1 group-hover:text-brand-600 transition-colors mb-1`}>
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1 mb-3">
            {compact ? <>By <span className="font-medium text-gray-700">{product.seller?.username || product.seller?.full_name || product.seller_name || 'RJN Official'}</span></> : product.description}
          </p>
        </div>

        {showPrice ? (
          <div className={compact ? 'mb-4' : 'flex items-center justify-between mb-4'}>
            {compact ? (
              <span className="font-bold text-brand-600 text-base">{price}</span>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Price</span>
                <span className="font-black text-gray-900 text-lg">{price}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <span className="font-bold text-gray-500 text-sm">Price on request</span>
          </div>
        )}

        <div className="relative z-20 grid grid-cols-2 gap-2">
          <button onClick={addToCart} type="button" className={`flex items-center justify-center gap-2 ${compact ? 'py-2.5 bg-brand-500 text-white hover:bg-brand-600' : 'py-3 bg-brand-500 text-white hover:bg-brand-600'} text-xs font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-95`}>
            <i className="fa-solid fa-cart-plus text-sm"></i> Cart
          </button>
          <a href={`https://wa.me/9710509690664?text=${whatsappText}`} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 ${compact ? 'py-2.5 bg-brand-50 hover:bg-brand-900 hover:text-brand-100 text-brand-700' : 'py-3 bg-brand-900 text-brand-100 hover:bg-brand-800'} text-xs font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-brand-900/25 active:scale-95`}>
            <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
