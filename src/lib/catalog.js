import { supabase } from './supabaseClient'
import { normalizeProductImages } from './productImages'

export async function fetchCategories() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchProducts(filters = {}) {
  if (!supabase) return []

  const categoryId = await resolveCategoryId(filters.category)

  let query = supabase
    .from('products')
    .select('*, category:categories(*), feedback(rating), seller:profiles(full_name)')
    .eq('is_active', true)

  if (filters.search?.trim()) {
    const term = sanitizeSearchTerm(filters.search)
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
  }
  if (filters.category && !categoryId) return []
  if (categoryId) query = query.eq('category_id', categoryId)
  if (filters.minPrice) query = query.gte('price', Number(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice))

  const sortMap = {
    newest: ['created_at', { ascending: false }],
    price_low: ['price', { ascending: true }],
    price_high: ['price', { ascending: false }],
    name: ['name', { ascending: true }],
  }
  const [column, options] = sortMap[filters.sort] || sortMap.newest

  const { data, error } = await query.order(column, options)
  if (error) throw error

  return (data || []).map((product) => ({
    ...product,
    rating: averageRating(product.feedback),
    image_url: normalizeProductImages(product)[0] || product.image_url || product.image,
    image_urls: normalizeProductImages(product),
    show_price: product.show_price ?? true,
  }))
}

export async function fetchSellerProducts(sellerId) {
  if (!supabase || !sellerId) return []

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('seller_id', sellerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((product) => ({
    ...product,
    image_url: normalizeProductImages(product)[0] || product.image_url || product.image,
    image_urls: normalizeProductImages(product),
  }))
}

async function resolveCategoryId(category) {
  if (!category) return ''
  if (isUuid(category)) return category

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)
    .maybeSingle()

  if (error) throw error
  return data?.id || ''
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function sanitizeSearchTerm(value) {
  return value.trim().replace(/[,%()]/g, ' ')
}

export async function fetchProduct(id) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), feedback(*, profiles(full_name))')
    .eq('id', id)
    .single()

  if (error) throw error
  return {
    ...data,
    image_url: normalizeProductImages(data)[0] || data.image_url || data.image,
    image_urls: normalizeProductImages(data),
    rating: averageRating(data.feedback),
    show_price: data.show_price ?? true,
    show_seller: data.show_seller ?? true,
  }
}

function averageRating(feedback = []) {
  if (!feedback?.length) return null
  return feedback.reduce((total, item) => total + Number(item.rating), 0) / feedback.length
}
