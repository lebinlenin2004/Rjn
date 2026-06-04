import { useContext } from 'react'
import { CartContext } from './cartStore'

export function useCart() {
  return useContext(CartContext)
}
