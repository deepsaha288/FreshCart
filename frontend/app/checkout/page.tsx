'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useCartStore } from '@/lib/store/cartStore'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<Array<{ product_id: string; product_name: string; price_snapshot: number; quantity: number; unit: string }>>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [cartLoading, setCartLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    customer_name: '',
  })

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.getCart()
        setItems(response.data.items || [])
        setTotalPrice(response.data.total_price || 0)
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
    return <div className="min-h-screen flex items-center justify-center text-emerald-900">Loading checkout...</div>
  }

  if (!error && items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-emerald-950/10 bg-[#f6f7f2]/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <a href="/cart" className="inline-flex items-center gap-2 text-sm font-black text-emerald-900 hover:text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-800 text-lime-200">F</span>
            Back to cart
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Final step</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-emerald-950">Complete your order</h1>
        <p className="mb-8 mt-2 text-sm text-emerald-950/60">Confirm your name and we will start preparing your groceries.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-black text-emerald-950">
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
                    className="w-full rounded-md border border-emerald-950/15 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-700 focus:ring-2 focus:ring-lime-300/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="mt-6 w-full rounded-md bg-emerald-800 py-3 text-sm font-black text-white hover:bg-emerald-900 disabled:bg-emerald-300"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-black text-emerald-950">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-gray-600">{item.quantity} {item.unit}</p>
                    </div>
                    <p className="font-semibold">₹{(item.price_snapshot * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                ✓ Fresh delivery within 24 hours
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

