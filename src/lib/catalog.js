import { apiRequest, getResults } from './api'
import { normalizeProductImages } from './productImages'

export async function fetchCategories() {
  return getResults(await apiRequest('/categories/'))
}

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search?.trim()) params.set('q', sanitizeSearchTerm(filters.search))
  if (filters.minPrice) params.set('min_price', filters.minPrice)
  if (filters.maxPrice) params.set('max_price', filters.maxPrice)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.mine) params.set('mine', '1')

  const data = getResults(await apiRequest(`/products/${params.toString() ? `?${params}` : ''}`))
  return data.map((product) => ({
    ...product,
    rating: product.rating ?? averageRating(product.feedback),
    image_url: normalizeProductImages(product)[0] || product.image_url || product.image,
    image_urls: normalizeProductImages(product),
    show_price: product.show_price ?? true,
  }))
}

export async function fetchSellerProducts() {
  const data = getResults(await apiRequest('/products/?mine=1'))
  return data.map((product) => ({
    ...product,
    image_url: normalizeProductImages(product)[0] || product.image_url || product.image,
    image_urls: normalizeProductImages(product),
  }))
}

function sanitizeSearchTerm(value) {
  return value.trim().replace(/[,%()]/g, ' ')
}

export async function fetchProduct(id) {
  const data = await apiRequest(`/products/${id}/`)
  return {
    ...data,
    image_url: normalizeProductImages(data)[0] || data.image_url || data.image,
    image_urls: normalizeProductImages(data),
    rating: data.rating ?? averageRating(data.feedback),
    show_price: data.show_price ?? true,
    show_seller: data.show_seller ?? true,
  }
}

function averageRating(feedback = []) {
  if (!feedback?.length) return null
  return feedback.reduce((total, item) => total + Number(item.rating), 0) / feedback.length
}
