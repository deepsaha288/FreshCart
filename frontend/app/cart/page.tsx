'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useCartStore } from '@/lib/store/cartStore'

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const setItems = useCartStore((state) => state.setItems)
  const setTotalPrice = useCartStore((state) => state.setTotalPrice)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.getCart()
        setItems(response.data.items || [])
        setTotalPrice(response.data.total_price || 0)
      } catch (err) {
        console.error('Cart page: Error fetching cart:', err)
        if ((err as any).response?.status === 401) {
          router.push('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [setItems, setTotalPrice, router])

  const handleUpdateQuantity = async (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change
    setUpdatingId(productId)
    try {
      if (newQty <= 0) {
        const res = await apiClient.removeFromCart(productId)
        setItems(res.data.items || [])
        setTotalPrice(res.data.total_price || 0)
      } else {
        const res = await apiClient.updateCartItem(productId, newQty)
        setItems(res.data.items || [])
        setTotalPrice(res.data.total_price || 0)
      }
    } catch (err: any) {
      console.error('Error updating cart:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdatingId(productId)
    try {
      const res = await apiClient.removeFromCart(productId)
      setItems(res.data.items || [])
      setTotalPrice(res.data.total_price || 0)
    } catch (err: any) {
      console.error('Error removing item:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center text-sm font-bold text-emerald-900">
        Loading your cart...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <nav className="border-b border-emerald-950/10 bg-[#f6f7f2]/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-black text-emerald-900 hover:text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-lime-200 font-extrabold">←</span>
            Continue Shopping
          </Link>
          <Link href="/profile" className="text-xs font-bold text-emerald-900 hover:underline">
            👤 My Profile & Orders
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 border-b border-emerald-950/10 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Your Basket</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-emerald-950">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-emerald-950/20 bg-white p-12 text-center rounded-2xl">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-bold text-slate-900 text-lg mb-1">Your cart is currently empty</p>
            <p className="text-slate-500 text-sm mb-6">Explore our market to add fresh items.</p>
            <Link
              href="/products"
              className="inline-block bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-900 transition shadow"
            >
              Browse Products Market
            </Link>
          </div>
        ) : (
          <div className="border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6 rounded-2xl">
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.product_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-950 text-base">{item.product_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ₹{item.price_snapshot} per {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                        disabled={updatingId === item.product_id}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm font-black text-slate-700 hover:bg-slate-200 transition flex items-center justify-center disabled:opacity-50"
                        title={item.quantity === 1 ? 'Remove' : 'Decrease'}
                      >
                        {item.quantity === 1 ? '🗑️' : '−'}
                      </button>
                      <span className="font-black text-xs px-2 text-slate-900">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                        disabled={updatingId === item.product_id}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm font-black text-slate-700 hover:bg-slate-200 transition flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-emerald-900 text-lg">
                        ₹{(item.price_snapshot * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        disabled={updatingId === item.product_id}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center text-xl font-black text-slate-950">
                <span>Total Amount:</span>
                <span className="text-emerald-900">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-xl bg-emerald-800 py-3.5 text-center text-sm font-black text-white hover:bg-emerald-900 transition shadow"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
