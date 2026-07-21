// Cart store using Zustand
import { create } from 'zustand'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  totalPrice: number
  setItems: (items: CartItem[]) => void
  setTotalPrice: (price: number) => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateItem: (productId: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalPrice: 0,

  setItems: (items) => set({ items }),
  setTotalPrice: (price) => set({ totalPrice: price }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.product_id === item.product_id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        state.items.push(item)
      }
      const totalPrice = state.items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items: state.items, totalPrice }
    }),

  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.product_id !== productId)
      const totalPrice = items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items, totalPrice }
    }),

  updateItem: (productId, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.product_id === productId)
      if (item) {
        item.quantity = quantity
      }
      const totalPrice = state.items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)
      return { items: state.items, totalPrice }
    }),

  clear: () => set({ items: [], totalPrice: 0 }),
}))
