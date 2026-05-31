export const UAE_DIRHAM_SYMBOL = 'AED'

export function hasPrice(product) {
  return product?.show_price !== false && product?.price !== null && product?.price !== undefined && product?.price !== ''
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return 'Price on request'

  return `${UAE_DIRHAM_SYMBOL} ${Number(value).toFixed(2)}`
}
