import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Notice from '../components/Notice'
import ProductCard from '../components/ProductCard'
import { fetchCategories, fetchProducts } from '../lib/catalog'
import { useAuth } from '../lib/useAuth'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const { supabaseReady } = useAuth()

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
    fetchProducts({ sort: 'newest' })
      .then((items) => setProducts(items.slice(0, 6)))
      .catch(() => setProducts([]))
  }, [])

  return (
    <>
      <section className="relative pt-20 pb-24 overflow-hidden bg-brand-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-300/25 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-brand-100 border border-brand-300/30 rounded-full text-xs font-bold mb-6">
                <span className="flex h-2 w-2 rounded-full bg-brand-300 animate-pulse"></span>
                RJN premium grocery supply
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Everything for your <br />
                <span className="text-brand-200">Premium Kitchen.</span>
              </h1>
              <p className="text-lg text-gray-200 mb-10 leading-relaxed max-w-lg">
                Your one-stop destination for farm-fresh vegetables, premium meats, pure oils, and all your essential kitchen needs delivered fresh.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="px-8 py-4 bg-brand-200 text-brand-900 font-bold rounded-2xl hover:bg-brand-100 shadow-xl shadow-brand-900/30 transition-all active:scale-95">
                  Explore Kitchen
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-white/10 text-brand-100 border border-brand-200/30 font-bold rounded-2xl hover:bg-white/15 transition-all active:scale-95">
                  Our Story
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-black/30 border border-brand-300/30">
                <img src="/images/hero-kitchen.jpg" alt="Everything for Kitchen" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#fffaf0] p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-brand-100">
                <div className="w-12 h-12 bg-brand-900 rounded-2xl flex items-center justify-center text-brand-200">
                  <i className="fa-solid fa-truck-fast text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-500">To your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!supabaseReady ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Notice>
            Supabase is not connected yet. Add your keys in <code>.env</code> to load your live catalog.
          </Notice>
        </div>
      ) : null}

      <section className="py-16 bg-[#fffaf0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-500">Find exactly what you&apos;re looking for</p>
            </div>
          </div>
          <div className="flex overflow-x-auto category-scroll gap-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <CategoryCard name="All Items" to="/products" image="/images/hero-kitchen.jpg" />
            {categories.map((category) => (
              <CategoryCard key={category.id} name={category.name} to={`/products?category=${category.slug || category.id}`} image={category.image_url || category.image || '/images/hero-kitchen.jpg'} />
            ))}
            {categories.length === 0 ? (
              <div className="min-w-[260px] p-8 bg-white rounded-3xl border border-dashed border-brand-100 text-gray-500 text-sm font-semibold">
                Product categories will appear here after they are added in Supabase.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-2 uppercase tracking-widest">
                <i className="fa-solid fa-fire"></i> Trending Now
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Picks</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
              View All <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>

          <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
            {products.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">No featured products yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Add active products in Supabase to show them on the homepage.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-brand-900 rounded-[2.5rem] p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-300 opacity-10 blur-3xl -right-1/4 -top-1/4"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-4">Are you a Business?</h2>
              <p className="text-lg text-gray-400 mb-0 leading-relaxed">Exclusive pricing for bulk inquiries. We supply retail shops, offices, and institutions with premium quality goods.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/bulk-order" className="px-8 py-4 bg-brand-200 text-brand-900 font-bold rounded-2xl hover:bg-brand-100 transition-all shadow-xl shadow-black/20">
                Get Bulk Quote
              </Link>
              <Link to="/products" className="px-8 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all">
                View Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryCard({ image, name, to }) {
  return (
    <Link to={to} className="group relative flex-shrink-0 w-[200px] sm:w-[240px] aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity"></div>
      <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute bottom-8 left-8 right-8 z-20">
        <h3 className="text-white font-black text-xl leading-tight mb-2 tracking-tight">{name}</h3>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-[10px] font-bold uppercase tracking-widest border border-white/20 group-hover:bg-brand-500 group-hover:border-brand-400 transition-all">
          Explore <i className="fa-solid fa-chevron-right text-[8px]"></i>
        </div>
      </div>
    </Link>
  )
}
