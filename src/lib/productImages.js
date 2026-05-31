export function normalizeProductImages(product) {
  const images = Array.isArray(product?.image_urls) ? product.image_urls : []
  const fallback = product?.image_url || product?.image

  return [...images, fallback].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index)
}
