// Cart store using Zustand
import { create } from 'zustand'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  totalPrice: number
  setItems: (items: CartItem[]) => void
  setTotalPrice: (price: number) => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateItem: (productId: string, quantity: number, variantId?: string) => void
  clear: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalPrice: 0,

  setItems: (items) => set({ items }),
  setTotalPrice: (price) => set({ totalPrice: price }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
      )
      if (existing) {
        existing.quantity += item.quantity
      } else {
        state.items.push(item)
      }
      const totalPrice = state.items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items: [...state.items], totalPrice }
    }),

  removeItem: (productId, variantId) =>
    set((state) => {
      const items = state.items.filter(
        (i) => !(i.product_id === productId && i.variant_id === variantId)
      )
      const totalPrice = items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items, totalPrice }
    }),

  updateItem: (productId, quantity, variantId) =>
    set((state) => {
      const items = state.items.map((i) => {
        if (i.product_id === productId && i.variant_id === variantId) {
          return { ...i, quantity }
        }
        return i
      })
      const totalPrice = items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items, totalPrice }
    }),

  clear: () => set({ items: [], totalPrice: 0 }),
}))
