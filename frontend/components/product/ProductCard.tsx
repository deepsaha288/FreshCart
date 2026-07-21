'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { apiClient } from '@/lib/api'
import { useCartStore } from '@/lib/store/cartStore'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const cartItems = useCartStore((state) => state.items)
  const setCartItems = useCartStore((state) => state.setItems)
  const setCartTotal = useCartStore((state) => state.setTotalPrice)

  // Find item in cart
  const cartItem = cartItems.find((i) => i.product_id === product.id)
  const cartQty = cartItem ? cartItem.quantity : 0

  const handleUpdateQuantity = async (newQuantity: number) => {
    setLoading(true)
    try {
      if (newQuantity <= 0) {
        const response = await apiClient.removeFromCart(product.id)
        setCartItems(response.data.items || [])
        setCartTotal(response.data.total_price || 0)
      } else if (cartQty === 0) {
        const response = await apiClient.addToCart(product.id, newQuantity)
        setCartItems(response.data.items || [])
        setCartTotal(response.data.total_price || 0)
      } else {
        const response = await apiClient.updateCartItem(product.id, newQuantity)
        setCartItems(response.data.items || [])
        setCartTotal(response.data.total_price || 0)
      }
    } catch (err: any) {
      console.error('Failed to update cart:', err)
      alert(err.response?.data?.detail || 'Failed to update cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-xl flex flex-col justify-between">
      <div>
        {/* Image & Badge */}
        <div className="aspect-[4/3] bg-[#f2f5ef] relative overflow-hidden">
          {product.image_url && !imageFailed ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-emerald-900 text-3xl font-black text-lime-200">
              {product.name.charAt(0)}
            </div>
          )}

          {cartQty > 0 && (
            <span className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
              {cartQty} IN BASKET
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="min-h-10 text-sm font-black leading-5 text-slate-900 sm:text-base line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 font-medium">
            {product.unit ? `Per ${product.unit}` : ''}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-lg font-black text-slate-950 sm:text-xl">₹{product.price}</span>
            </div>
            {!product.is_available && (
              <span className="text-[10px] font-black uppercase tracking-wide text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Instamart Style ADD / Stepper Button */}
      <div className="p-3 sm:p-4 pt-0">
        {product.is_available && (
          <div>
            {cartQty === 0 ? (
              <button
                onClick={() => handleUpdateQuantity(1)}
                disabled={loading}
                className="w-full rounded-xl border-2 border-emerald-700 bg-emerald-50/60 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-800 hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {loading ? 'Adding...' : 'ADD +'}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-emerald-800 text-white rounded-xl h-9 px-1 shadow transition-all">
                <button
                  onClick={() => handleUpdateQuantity(cartQty - 1)}
                  disabled={loading}
                  className="w-8 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:scale-95 font-black text-base flex items-center justify-center transition disabled:opacity-50"
                  title={cartQty === 1 ? 'Remove from basket' : 'Decrease'}
                >
                  −
                </button>
                <span className="font-black text-xs px-2 text-white">
                  {cartQty}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(cartQty + 1)}
                  disabled={loading}
                  className="w-8 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:scale-95 font-black text-base flex items-center justify-center transition disabled:opacity-50"
                  title="Increase"
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
