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

  const hasStockErrors = items.some(
    (item) => !item.is_available || item.quantity_available < item.quantity
  )

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

  const handleUpdateQuantity = async (productId: string, currentQty: number, change: number, variantId?: string) => {
    const newQty = currentQty + change
    const item = items.find(i => i.product_id === productId && i.variant_id === variantId)
    if (change > 0 && item && newQty > item.quantity_available) {
      alert(`Cannot add more. Only ${item.quantity_available} units available in stock.`)
      return
    }
    const itemKey = variantId ? `${productId}:${variantId}` : productId
    setUpdatingId(itemKey)
    try {
      if (newQty <= 0) {
        const res = await apiClient.removeFromCart(productId, variantId)
        setItems(res.data.items || [])
        setTotalPrice(res.data.total_price || 0)
      } else {
        const res = await apiClient.updateCartItem(productId, newQty, variantId)
        setItems(res.data.items || [])
        setTotalPrice(res.data.total_price || 0)
      }
    } catch (err: any) {
      console.error('Error updating cart:', err)
      alert(err.response?.data?.detail || 'Failed to update cart')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveItem = async (productId: string, variantId?: string) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId
    setUpdatingId(itemKey)
    try {
      const res = await apiClient.removeFromCart(productId, variantId)
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
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center text-sm font-bold text-[#3c006b] animate-pulse">
        Loading your cart...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Zepto styled top header */}
      <nav className="bg-[#3c006b] text-white sticky top-0 z-50 shadow-md">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-black text-white hover:text-[#ffccd5]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white font-extrabold">←</span>
            Back to Shop
          </Link>
          <Link href="/profile" className="text-xs font-black text-white/95 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl">
            👤 My Orders
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 border-b border-slate-200 pb-6 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff3b60]">Your Basket</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800">Shopping Cart</h1>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            {items.length} items
          </span>
        </div>

        {items.length === 0 ? (
          <div className="border border-slate-200 bg-white p-12 text-center rounded-2xl shadow-sm">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-bold text-slate-900 text-lg mb-1">Your cart is currently empty</p>
            <p className="text-slate-500 text-sm mb-6">Explore our market to add fresh items.</p>
            <Link
              href="/products"
              className="inline-block bg-[#3c006b] hover:bg-[#5e00a3] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow"
            >
              Browse Products Market
            </Link>
          </div>
        ) : (
          <div className="border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6 rounded-2xl">
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const itemOutOfStock = !item.is_available || item.quantity_available <= 0;
                const itemInsufficientStock = !itemOutOfStock && item.quantity > item.quantity_available;
                const itemKey = item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id;

                return (
                  <div key={itemKey} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {item.product_name}
                        {item.variant_id && (
                          <span className="ml-2 text-[9px] bg-[#ffccd5]/50 text-[#3c006b] font-black px-1.5 py-0.5 rounded-md uppercase">
                            {item.unit}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        ₹{item.price_snapshot} per {item.unit}
                      </p>
                      {itemOutOfStock && (
                        <p className="text-rose-600 font-extrabold text-xs mt-1">Out of Stock / Unavailable</p>
                      )}
                      {itemInsufficientStock && (
                        <p className="text-amber-600 font-extrabold text-xs mt-1">
                          Only {item.quantity_available} remaining in stock (requested {item.quantity})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1, item.variant_id)}
                          disabled={updatingId === itemKey}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm font-black text-slate-700 hover:bg-slate-200 transition flex items-center justify-center disabled:opacity-50"
                          title={item.quantity === 1 ? 'Remove' : 'Decrease'}
                        >
                          {item.quantity === 1 ? '🗑️' : '−'}
                        </button>
                        <span className="font-black text-xs px-2 text-slate-900">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1, item.variant_id)}
                          disabled={updatingId === itemKey || itemOutOfStock || item.quantity >= item.quantity_available}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm font-black text-slate-700 hover:bg-slate-200 transition flex items-center justify-center disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-slate-900 text-lg">
                          ₹{(item.price_snapshot * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.product_id, item.variant_id)}
                          disabled={updatingId === itemKey}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center text-xl font-black text-slate-800">
                <span>Total Amount:</span>
                <span className="text-[#3c006b]">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {hasStockErrors ? (
              <div>
                <button
                  disabled
                  className="mt-6 block w-full rounded-xl bg-slate-300 py-3.5 text-center text-sm font-black text-slate-500 cursor-not-allowed shadow animate-pulse"
                >
                  Proceed to Checkout →
                </button>
                <p className="text-rose-600 font-black text-xs mt-2 text-center">
                  Please resolve out-of-stock or insufficient quantity items before checking out.
                </p>
              </div>
            ) : (
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-xl bg-[#3c006b] hover:bg-[#5e00a3] py-3.5 text-center text-sm font-black text-white transition shadow-md shadow-[#3c006b]/10 active:scale-[0.99] flex items-center justify-center gap-1"
              >
                Proceed to Checkout →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
