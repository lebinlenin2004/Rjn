import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { fetchCategories, fetchProducts } from '../lib/catalog'

export default function ProductsPage() {
  const [categories, setCategories] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '')

  const filters = useMemo(() => ({
    category: searchParams.get('category') || '',
    maxPrice: searchParams.get('max_price') || '',
    minPrice: searchParams.get('min_price') || '',
    search: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'newest',
  }), [searchParams])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setSearchDraft(filters.search)
  }, [filters.search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchDraft.trim()
      if (nextSearch === filters.search) return

      const next = new URLSearchParams(searchParams)
      if (nextSearch) next.set('q', nextSearch)
      else next.delete('q')
      setSearchParams(next, { replace: true })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [filters.search, searchDraft, searchParams, setSearchParams])

  useEffect(() => {
    setLoading(true)
    fetchProducts(filters)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [filters])

  function submitSearch(event) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const q = new FormData(event.currentTarget).get('q')?.toString().trim()
    if (q) next.set('q', q)
    else next.delete('q')
    setSearchParams(next)
  }

  function submitFilters(event) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const data = new FormData(event.currentTarget)
    for (const key of ['min_price', 'max_price']) {
      const value = data.get(key)
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next)
  }

  function setCategory(category) {
    const next = new URLSearchParams(searchParams)
    if (category) next.set('category', category)
    else next.delete('category')
    setSearchParams(next)
  }

  function setSort(event) {
    const next = new URLSearchParams(searchParams)
    next.set('sort', event.target.value)
    setSearchParams(next)
  }

  return (
    <>
      <section className="bg-white pt-16 pb-8 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore RJN Foods</h1>
              <p className="text-gray-500 text-sm">Discover premium kitchen essentials from trusted RJN suppliers.</p>
            </div>

            <div className="w-full md:max-w-md">
              <form onSubmit={submitSearch} className="relative group">
                <input type="text" name="q" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search for products..." className="w-full pl-12 pr-24 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all duration-300 group-hover:bg-gray-100" />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-4 bg-brand-500 text-white text-xs font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-40 bg-[#fffaf0]/90 backdrop-blur-md border-b border-brand-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
              <button onClick={() => setCategory('')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${!filters.category ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                All Categories
              </button>
              {categories.map((category) => {
                const value = category.slug || category.id
                return (
                  <button key={category.id} onClick={() => setCategory(value)} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filters.category === value ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    {category.name}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={() => setFilterOpen((value) => !value)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm ${filterOpen ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600'}`}>
                <i className="fa-solid fa-sliders"></i> Filters
              </button>
              <div className="relative flex-1 md:flex-none">
                <select value={filters.sort} onChange={setSort} className="w-full appearance-none pl-5 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-brand-500 focus:ring-0 transition-all cursor-pointer shadow-sm">
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]"></i>
              </div>
            </div>
          </div>

          <div className={`${filterOpen ? 'block animate-fade-in' : 'hidden'} mt-4 pt-6 border-t border-gray-100`}>
            <form onSubmit={submitFilters} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">AED</span>
                    <input type="number" name="min_price" defaultValue={filters.minPrice} placeholder="Min" className="w-full pl-16 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all text-sm" />
                  </div>
                  <div className="w-4 h-px bg-gray-300"></div>
                  <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">AED</span>
                    <input type="number" name="max_price" defaultValue={filters.maxPrice} placeholder="Max" className="w-full pl-16 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <button type="submit" className="flex-grow py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-brand-500 transition-all shadow-lg">Apply Filters</button>
                <Link to="/products" className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all">Reset</Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#fffaf0] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? <p className="text-sm font-bold text-gray-400 mb-6">Loading products...</p> : null}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {products.map((product) => <ProductCard compact key={product.id} product={product} />)}
            {!loading && products.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-magnifying-glass text-2xl text-gray-300"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn&apos;t find any products matching your search criteria. Try adjusting your filters.</p>
                <Link to="/products" className="inline-flex items-center px-8 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                  View All Products
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
