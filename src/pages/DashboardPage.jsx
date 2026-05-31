import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchSellerProducts } from '../lib/catalog'
import { formatPrice } from '../lib/price'
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
  const [editingProductId, setEditingProductId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const loadProducts = useCallback(() => {
    return fetchSellerProducts(session.user.id).then(setProducts).catch(() => setProducts([]))
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id) return

    loadProducts()
  }, [loadProducts, session?.user?.id])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const isEditing = Boolean(editingProductId)
    setStatus({ type: 'info', text: isEditing ? 'Updating product...' : 'Saving product...' })

    if (!isEditing && !imageFile) {
      setStatus({ type: 'error', text: 'Please choose a product image.' })
      return
    }

    let imageUrl = null
    if (imageFile) {
      const { error: uploadError, publicUrl } = await uploadProductImage(imageFile, session.user.id)
      if (uploadError) {
        setStatus({ type: 'error', text: `Image upload failed: ${uploadError}` })
        return
      }
      imageUrl = publicUrl
    }

    const payload = {
      category_id: form.category_id,
      description: form.description,
      min_order_quantity: Number(form.min_order_quantity),
      name: form.name,
      price: form.price === '' ? null : Number(form.price),
    }

    if (imageUrl) payload.image_url = imageUrl

    const { error } = isEditing
      ? await supabase
        .from('products')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingProductId)
        .eq('seller_id', session.user.id)
      : await supabase.from('products').insert({
        ...payload,
        image_url: imageUrl,
        is_active: true,
        seller_id: session.user.id,
      })

    if (error) {
      setStatus({ type: 'error', text: error.message })
      return
    }

    formElement.reset()
    resetForm()
    setStatus({ type: 'success', text: isEditing ? 'Product updated.' : 'Product saved with image.' })
    loadProducts()
  }

  function startEditing(product) {
    setEditingProductId(product.id)
    setForm({
      category_id: product.category_id || '',
      description: product.description || '',
      min_order_quantity: product.min_order_quantity || 1,
      name: product.name || '',
      price: product.price || '',
    })
    setImageFile(null)
    setShowForm(true)
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingProductId(null)
    setForm(emptyProduct)
    setImageFile(null)
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`Are you sure you want to delete "${product.name}"?`)
    if (!confirmed) return

    setStatus({ type: 'info', text: 'Deleting product...' })
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', product.id)
      .eq('seller_id', session.user.id)

    if (error) {
      setStatus({ type: 'error', text: error.message })
      return
    }

    if (editingProductId === product.id) resetForm()
    setProducts((current) => current.filter((item) => item.id !== product.id))
    setStatus({ type: 'success', text: 'Product deleted.' })
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
            <button onClick={() => {
              if (showForm && editingProductId) resetForm()
              setShowForm((value) => !value)
            }} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95">
              <i className="fa-solid fa-plus"></i>
              <span>{showForm ? 'Close Form' : 'List New Product'}</span>
            </button>
          </div>
        </div>

        {status ? (
          <StatusMessage status={status} />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Stat icon="fa-box-archive" title="Total Listings" value={products.length} color="brand" />
          <Stat icon="fa-eye" title="Active Views" value="--" color="blue" />
          <Stat icon="fa-star" title="Shop Rating" value="--" color="amber" />
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
                    <h2 className="text-3xl font-black text-white">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
                    <p className="text-brand-100 font-medium mt-1">{editingProductId ? 'Update your item details' : 'List your item for buyers'}</p>
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
                    <Field label="Price (AED) optional" name="price" value={form.price} onChange={updateField} type="number" />
                    <Field label="MOQ" name="min_order_quantity" value={form.min_order_quantity} onChange={updateField} type="number" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Product Image</label>
                    <input className="rjn-input" name="image" onChange={(event) => setImageFile(event.target.files?.[0] || null)} type="file" accept="image/*" required={!editingProductId} />
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed px-1 mt-2">{editingProductId ? 'Choose a new image only if you want to replace the current one.' : 'The image uploads to Supabase Storage before the product is saved.'}</p>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 active:scale-[0.98]">
                      {editingProductId ? 'Update Product' : 'List Product Now'}
                    </button>
                    {editingProductId ? (
                      <button type="button" onClick={resetForm} className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">
                        Cancel
                      </button>
                    ) : null}
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
                    <td className="py-5"><span className="text-sm font-bold text-brand-600">{formatPrice(product.price)}</span></td>
                    <td className="py-5 text-sm font-medium text-gray-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '--'}</td>
                    <td className="pr-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${product.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-600 text-xs font-bold border border-brand-100 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm">
                          <i className="fa-solid fa-eye"></i>
                          <span>View</span>
                        </Link>
                        <button onClick={() => startEditing(product)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 text-xs font-bold border border-blue-100 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                          <i className="fa-solid fa-pen"></i>
                          <span>Edit</span>
                        </button>
                        <button onClick={() => deleteProduct(product)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-xs font-bold border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <i className="fa-solid fa-trash"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 ? (
              <div className="px-8 py-12 text-center text-sm font-semibold text-gray-500">
                No products have been listed yet.
              </div>
            ) : null}
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
