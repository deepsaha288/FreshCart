'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useCartStore } from '@/lib/store/cartStore'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<Array<{ product_id: string; product_name: string; price_snapshot: number; quantity: number; unit: string; quantity_available: number; is_available: boolean; variant_id?: string }>>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [cartLoading, setCartLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasStockErrors, setHasStockErrors] = useState(false)
  
  const [formData, setFormData] = useState({
    customer_name: '',
  })

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.getCart()
        const cartItems = response.data.items || []
        setItems(cartItems)
        setTotalPrice(response.data.total_price || 0)
        
        const stockErrors = cartItems.some(
          (item: any) => !item.is_available || item.quantity_available < item.quantity
        )
        setHasStockErrors(stockErrors)
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/auth')
        } else {
          setError('Unable to load your cart. Please return to the cart and try again.')
        }
      } finally {
        setCartLoading(false)
      }
    }

    fetchCart()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Checkout: Submitting order with data:', formData)
      const response = await apiClient.checkout(formData)
      console.log('Checkout: Order created successfully:', response.data)
      
      // Clear cart store
      useCartStore.setState({ items: [], totalPrice: 0 })
      
      // Redirect to order confirmation
      router.push(`/order-confirmation/${response.data.order_id}`)
    } catch (err: any) {
      console.error('Checkout: Error placing order:', err)
      const errorMessage = err.response?.data?.detail || 'Failed to place order. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (cartLoading) {
    return <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center text-sm font-bold text-[#3c006b] animate-pulse">Loading checkout...</div>
  }

  if (!error && items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Zepto styled top header */}
      <nav className="bg-[#3c006b] text-white shadow-md sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <a href="/cart" className="inline-flex items-center gap-2 text-sm font-black text-white hover:text-[#ffccd5]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white font-extrabold">←</span>
            Back to cart
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff3b60]">Final step</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800">Complete your order</h1>
        <p className="mb-8 mt-2 text-xs text-slate-500 font-bold">Confirm your name and we will start preparing your groceries instantly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6 rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                 {error && (
                  <div className="border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-600 rounded-xl text-center">
                    {error}
                  </div>
                )}

                {hasStockErrors && (
                  <div className="border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-600 rounded-xl text-center">
                    Warning: Some items in your order are out of stock or have insufficient quantity. Please return to your cart to adjust them.
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    minLength={2}
                    disabled={hasStockErrors}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#3c006b] focus:ring-2 focus:ring-[#ffccd5]/50 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || items.length === 0 || hasStockErrors}
                  className="mt-6 w-full rounded-xl bg-[#3c006b] hover:bg-[#5e00a3] py-3.5 text-sm font-black text-white transition shadow-md shadow-[#3c006b]/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6 rounded-2xl">
              <h2 className="mb-4 text-base font-black text-slate-800">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id} className="flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.product_name}
                        {item.variant_id && (
                          <span className="ml-1 text-[8px] bg-[#ffccd5]/45 text-[#3c006b] font-black px-1 py-0.5 rounded-md uppercase">
                            {item.unit}
                          </span>
                        )}
                      </p>
                      <p className="text-slate-400 font-semibold">{item.quantity} {item.unit}</p>
                    </div>
                    <p className="font-black text-slate-800">₹{(item.price_snapshot * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 mt-3">
                  <span className="font-black text-sm text-slate-800">Total</span>
                  <span className="font-black text-base text-[#3c006b]">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1.5 justify-center">
                <span>⚡</span> Instant delivery in 10 mins
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

