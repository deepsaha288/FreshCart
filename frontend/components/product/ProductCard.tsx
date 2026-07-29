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

  const hasVariants = !!(product.variants && product.variants.length > 0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    hasVariants ? product.variants![0].id : undefined
  )

  const cartItems = useCartStore((state) => state.items)
  const setCartItems = useCartStore((state) => state.setItems)
  const setCartTotal = useCartStore((state) => state.setTotalPrice)

  // Find active variant properties
  const selectedVariant = hasVariants
    ? product.variants!.find((v) => v.id === selectedVariantId) || product.variants![0]
    : null

  const activePrice = selectedVariant ? selectedVariant.price : product.price
  const activeUnit = selectedVariant ? selectedVariant.size : product.unit
  const activeQtyAvailable = selectedVariant ? selectedVariant.quantity_available : product.quantity_available
  const activeIsAvailable = selectedVariant
    ? (product.is_available && selectedVariant.quantity_available > 0)
    : product.is_available

  // Find item in cart matching product_id AND variant_id
  const cartItem = cartItems.find(
    (i) => i.product_id === product.id && i.variant_id === (selectedVariantId || undefined)
  )
  const cartQty = cartItem ? cartItem.quantity : 0

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity > cartQty && newQuantity > activeQtyAvailable) {
      alert(`Cannot add more. Only ${activeQtyAvailable} units available in stock.`)
      return
    }
    setLoading(true)
    try {
      if (newQuantity <= 0) {
        const response = await apiClient.removeFromCart(product.id, selectedVariantId)
        setCartItems(response.data.items || [])
        setCartTotal(response.data.total_price || 0)
      } else if (cartQty === 0) {
        const response = await apiClient.addToCart(product.id, newQuantity, selectedVariantId)
        setCartItems(response.data.items || [])
        setCartTotal(response.data.total_price || 0)
      } else {
        const response = await apiClient.updateCartItem(product.id, newQuantity, selectedVariantId)
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

  const originalPrice = Math.round(activePrice * 1.18)

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all duration-300 hover:shadow-lg flex flex-col justify-between hover:border-[#3c006b]/30">
      <div>
        {/* Image & Badge */}
        <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-3">
          {product.image_url && !imageFailed ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#3c006b]/10 text-3xl font-black text-[#3c006b] rounded-xl">
              {product.name.charAt(0)}
            </div>
          )}

          {/* Zepto-style Speed Delivery Tag */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur border border-slate-100 text-[#3c006b] text-[9px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <span className="text-[10px]">⚡</span> 10 MINS
          </div>

          {cartQty > 0 && (
            <span className="absolute top-2 right-2 bg-[#ff3b60] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow">
              {cartQty} IN CART
            </span>
          )}
        </div>        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="min-h-10 text-sm font-bold leading-5 text-slate-800 line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 font-semibold">
            {activeUnit ? `Per ${activeUnit}` : ''}
          </p>

          {/* Size/Weight Variant Selector Pills */}
          {hasVariants && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {product.variants!.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wide border transition-all ${
                    selectedVariantId === v.id
                      ? 'bg-[#3c006b] border-[#3c006b] text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900 sm:text-lg">₹{activePrice}</span>
              <span className="text-xs font-semibold text-slate-400 line-through">₹{originalPrice}</span>
            </div>
            {!activeIsAvailable || activeQtyAvailable <= 0 ? (
              <span className="text-[9px] font-black uppercase tracking-wide text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">Out of Stock</span>
            ) : activeQtyAvailable <= 10 ? (
              <span className="text-[9px] font-black uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">Only {activeQtyAvailable} left</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Zepto Style ADD / Stepper Button */}
      <div className="p-3 sm:p-4 pt-0">
        {activeIsAvailable && activeQtyAvailable > 0 && (
          <div>
            {cartQty === 0 ? (
              <button
                onClick={() => handleUpdateQuantity(1)}
                disabled={loading}
                className="w-full rounded-xl border border-[#3c006b] bg-white py-1.5 text-xs font-black text-[#3c006b] hover:bg-[#3c006b] hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 uppercase tracking-wider h-9"
              >
                {loading ? 'Adding...' : 'ADD'}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#3c006b] text-white rounded-xl h-9 px-1.5 shadow transition-all">
                <button
                  onClick={() => handleUpdateQuantity(cartQty - 1)}
                  disabled={loading}
                  className="w-7 h-7 rounded-lg bg-[#5e00a3]/85 hover:bg-[#5e00a3] active:scale-90 font-black text-sm flex items-center justify-center transition disabled:opacity-50"
                  title={cartQty === 1 ? 'Remove from basket' : 'Decrease'}
                >
                  −
                </button>
                <span className="font-black text-xs px-2 text-white">
                  {cartQty}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(cartQty + 1)}
                  disabled={loading || cartQty >= activeQtyAvailable}
                  className="w-7 h-7 rounded-lg bg-[#5e00a3]/85 hover:bg-[#5e00a3] active:scale-90 font-black text-sm flex items-center justify-center transition disabled:opacity-50"
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
