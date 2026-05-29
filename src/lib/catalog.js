import { supabase } from './supabaseClient'

export const fallbackCategories = [
  { id: 'vegetables', name: 'Vegetables', slug: 'vegetables', image_url: '/images/hero-kitchen.jpg' },
  { id: 'meat', name: 'Premium Meat', slug: 'premium-meat', image_url: '/images/hero-kitchen.jpg' },
  { id: 'oils', name: 'Pure Oils', slug: 'pure-oils', image_url: '/images/hero-kitchen.jpg' },
  { id: 'essentials', name: 'Kitchen Essentials', slug: 'kitchen-essentials', image_url: '/images/hero-kitchen.jpg' },
]

export const fallbackProducts = [
  {
    id: 'sample-1',
    name: 'Fresh Vegetable Combo Box',
    description: 'Farm-fresh seasonal vegetables packed for kitchens, stores, and institutions.',
    price: 24,
    min_order_quantity: 100,
    image_url: '/images/hero-kitchen.jpg',
    category: fallbackCategories[0],
    rating: 4.8,
    seller_name: 'RJN Wholesale',
    seller: { username: 'RJN Official' },
    show_price: true,
    show_seller: true,
  },
  {
    id: 'sample-2',
    name: 'Cold Pressed Cooking Oil',
    description: 'Pure cooking oil supplied in bulk packs for daily kitchen needs.',
    price: 68,
    min_order_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80',
    category: fallbackCategories[2],
    rating: 4.6,
    seller_name: 'RJN Wholesale',
    seller: { username: 'RJN Official' },
    show_price: true,
    show_seller: true,
  },
  {
    id: 'sample-3',
    name: 'Premium Chicken Cut Pack',
    description: 'Quality meat packs prepared for hotels, restaurants, and retail supply.',
    price: 310,
    min_order_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80',
    category: fallbackCategories[1],
    rating: 4.7,
    seller_name: 'RJN Wholesale',
    seller: { username: 'RJN Official' },
    show_price: true,
    show_seller: true,
  },
  {
    id: 'sample-4',
    name: 'Restaurant Spice Essentials',
    description: 'Everyday spice staples curated for commercial kitchens.',
    price: 42,
    min_order_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80',
    category: fallbackCategories[3],
    rating: 4.9,
    seller_name: 'RJN Wholesale',
    seller: { username: 'RJN Official' },
    show_price: true,
    show_seller: true,
  },
]

export async function fetchCategories() {
  if (!supabase) return fallbackCategories

  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function fetchProducts(filters = {}) {
  if (!supabase) return filterFallbackProducts(filters)

  let query = supabase
    .from('products')
    .select('*, category:categories(*), feedback(rating), seller:profiles(full_name)')
    .eq('is_active', true)

  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.category) query = query.eq('category_id', filters.category)
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

  return data.map((product) => ({
    ...product,
    rating: averageRating(product.feedback),
    image_url: product.image_url || product.image,
    show_price: product.show_price ?? true,
  }))
}

export async function fetchProduct(id) {
  if (!supabase) return fallbackProducts.find((product) => product.id === id)

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), feedback(*, profiles(full_name))')
    .eq('id', id)
    .single()

  if (error) throw error
  return {
    ...data,
    image_url: data.image_url || data.image,
    rating: averageRating(data.feedback),
    show_price: data.show_price ?? true,
    show_seller: data.show_seller ?? true,
  }
}

function averageRating(feedback = []) {
  if (!feedback?.length) return null
  return feedback.reduce((total, item) => total + Number(item.rating), 0) / feedback.length
}

function filterFallbackProducts(filters) {
  return fallbackProducts.filter((product) => {
    const matchesSearch = !filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = !filters.category || product.category.id === filters.category || product.category.slug === filters.category
    const matchesMin = !filters.minPrice || product.price >= Number(filters.minPrice)
    const matchesMax = !filters.maxPrice || product.price <= Number(filters.maxPrice)
    return matchesSearch && matchesCategory && matchesMin && matchesMax
  })
}
