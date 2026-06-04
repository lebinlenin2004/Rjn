import { useCallback, useEffect, useMemo, useState } from 'react'
import { getResults, shopApi } from './api'
import { CartContext } from './cartStore'
import { useAuth } from './useAuth'

export function CartProvider({ children }) {
  const { session } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCart = useCallback(() => {
    if (!session) {
      setItems([])
      return Promise.resolve([])
    }

    setLoading(true)
    return shopApi.listCart()
      .then((payload) => {
        const next = getResults(payload)
        setItems(next)
        return next
      })
      .finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    loadCart().catch(() => setItems([]))
  }, [loadCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    await shopApi.addCartItem(productId, quantity)
    return loadCart()
  }, [loadCart])

  const removeItem = useCallback(async (id) => {
    await shopApi.removeCartItem(id)
    return loadCart()
  }, [loadCart])

  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity < 1) return removeItem(id)
    await shopApi.updateCartItem(id, quantity)
    return loadCart()
  }, [loadCart, removeItem])

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + Number(item.quantity || 0), 0)
    const total = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0)
    return { addToCart, count, items, loadCart, loading, removeItem, total, updateQuantity }
  }, [addToCart, items, loadCart, loading, removeItem, updateQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
