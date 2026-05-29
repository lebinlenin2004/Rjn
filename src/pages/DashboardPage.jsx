import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchProducts } from '../lib/catalog'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'

const emptyProduct = {
  category_id: '',
  description: '',
  min_order_quantity: 1,
  name: '',
  price: '',
}

export default function DashboardPage() {
  const { session } = useAuth()
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchCategories().then(setCategories)
    fetchProducts().then(setProducts)
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setStatus({ type: 'info', text: 'Saving product...' })

    if (!imageFile) {
      setStatus({ type: 'error', text: 'Please choose a product image.' })
      return
    }

    const { error: uploadError, publicUrl } = await uploadProductImage(imageFile, session.user.id)
    if (uploadError) {
      setStatus({ type: 'error', text: `Image upload failed: ${uploadError}` })
      return
    }

    const { error } = await supabase.from('products').insert({
      ...form,
      image_url: publicUrl,
      min_order_quantity: Number(form.min_order_quantity),
      price: Number(form.price),
      seller_id: session.user.id,
    })

    if (error) {
      setStatus({ type: 'error', text: error.message })
      return
    }

    formElement.reset()
    setForm(emptyProduct)
    setImageFile(null)
    setStatus({ type: 'success', text: 'Product saved with image.' })
    fetchProducts().then(setProducts)
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm">Overview of your shop and inventory management.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95">
              <i className="fa-solid fa-plus"></i>
              <span>List New Product</span>
            </button>
          </div>
        </div>

        {status ? (
          <StatusMessage status={status} />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Stat icon="fa-box-archive" title="Total Listings" value={products.length} color="brand" />
          <Stat icon="fa-eye" title="Active Views" value="--" color="blue" />
          <Stat icon="fa-star" title="Shop Rating" value="4.9" color="amber" />
        </div>

        {showForm ? (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <div className="bg-brand-500 px-10 py-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-xl">
                    <i className="fa-solid fa-plus text-white text-3xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Add Product</h2>
                    <p className="text-brand-100 font-medium mt-1">List your item for buyers</p>
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <form onSubmit={submit} className="space-y-6">
                  <Field label="Product Name" name="name" value={form.name} onChange={updateField} required />
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Category</label>
                    <select className="rjn-input" name="category_id" value={form.category_id} onChange={updateField} required>
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </div>
                  <Field label="Description" name="description" value={form.description} onChange={updateField} textarea required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Price (AUED)" name="price" value={form.price} onChange={updateField} type="number" required />
                    <Field label="MOQ" name="min_order_quantity" value={form.min_order_quantity} onChange={updateField} type="number" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Product Image</label>
                    <input className="rjn-input" name="image" onChange={(event) => setImageFile(event.target.files?.[0] || null)} type="file" accept="image/*" required />
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed px-1 mt-2">The image uploads to Supabase Storage before the product is saved.</p>
                  </div>
                  <div className="pt-6 border-t border-gray-50">
                    <button className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 active:scale-[0.98]">
                      List Product Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{products.length} Products</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="pl-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product Info</th>
                  <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Added</th>
                  <th className="pr-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img src={product.image_url || '/placeholder-product.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">ID: #{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="px-3 py-1 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full uppercase tracking-widest">{product.category?.name || 'Kitchen'}</span>
                    </td>
                    <td className="py-5"><span className="text-sm font-bold text-brand-600">AUED {product.price}</span></td>
                    <td className="py-5 text-sm font-medium text-gray-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Today'}</td>
                    <td className="pr-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${product.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-600 text-xs font-bold border border-brand-100 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm">
                          <i className="fa-solid fa-eye"></i>
                          <span>View</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
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
    <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border mb-8 ${styles[status.type]}`}>
      <i className={`fa-solid ${icon[status.type]}`}></i>
      {status.text}
    </div>
  )
}

async function uploadProductImage(file, userId) {
  const extension = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('product-images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) return { error: error.message, publicUrl: null }

  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
  return { error: null, publicUrl: data.publicUrl }
}

function Stat({ color, icon, title, value }) {
  const colorClass = {
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    brand: 'bg-brand-50 text-brand-600',
  }[color]
  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mb-4`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  )
}

function Field({ label, name, onChange, required, textarea = false, type = 'text', value }) {
  const Control = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">{label}</label>
      <Control className="rjn-input" name={name} value={value} onChange={onChange} required={required} type={textarea ? undefined : type} />
    </div>
  )
}
