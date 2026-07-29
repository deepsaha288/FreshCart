'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useProductStore } from '@/lib/store/productStore'
import { useCartStore } from '@/lib/store/cartStore'
import ProductCard from '@/components/product/ProductCard'

interface Category {
  id: string
  name: string
  emoji?: string
  description?: string
  image_url?: string
  product_count?: number
}

export default function ProductsPage() {
  const router = useRouter()
  const products = useProductStore((state) => state.products)
  const setProducts = useProductStore((state) => state.setProducts)
  const cartItems = useCartStore((state) => state.items)
  const cartTotalPrice = useCartStore((state) => state.totalPrice)
  const setCartItems = useCartStore((state) => state.setItems)
  const setCartTotalPrice = useCartStore((state) => state.setTotalPrice)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catResponse = await apiClient.getCategories()
        setCategories(catResponse.data)

        // Fetch all products
        const prodResponse = await apiClient.getProducts()
        setProducts(prodResponse.data.items)

        // Fetch user cart
        try {
          const cartResponse = await apiClient.getCart()
          if (cartResponse.data?.items) {
            setCartItems(cartResponse.data.items)
            setCartTotalPrice(cartResponse.data.total_price || 0)
          }
        } catch (cErr) {
          // Ignore cart fetch error if unauthenticated
        }
      } catch (err) {
        setError('Failed to load data')
        if ((err as any).response?.status === 401) {
          router.push('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setProducts, setCartItems, setCartTotalPrice, router])

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchCategory = !selectedCategoryId || product.category_id === selectedCategoryId
    const matchSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="text-sm font-bold text-[#3c006b] animate-pulse">Loading FreshCart Zepto Market...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-12">
      {/* Zepto Style Premium Header */}
      <nav className="sticky top-0 z-50 bg-[#3c006b] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Delivery Status */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-tighter uppercase text-white">
                fresh<span className="text-[#ff3b60] lowercase">cart</span>
              </span>
            </Link>
            
            {/* Delivery Info Badge */}
            <div className="bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-white shadow-sm select-none">
              <span className="text-xs">⚡</span>
              <span className="text-[10px] font-black text-[#ffccd5] tracking-wider">10 MINS</span>
            </div>
          </div>

          {/* Pill Search Input */}
          <div className="w-full max-w-lg relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search rice, ghee, milk, paneer, flour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white border-0 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400/80 shadow-inner focus:ring-2 focus:ring-[#ffccd5]/60 transition-all"
            />
          </div>

          {/* Profile & Cart Widgets */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/profile"
              className="text-xs font-black text-white/90 hover:text-white transition flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 rounded-xl"
            >
              👤 Profile
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-xl bg-[#0c8346] px-4 py-2 text-xs font-black text-white hover:bg-[#0b743e] shadow-sm transition hover:scale-[1.02]"
            >
              🛒 Rs. {cartTotalPrice.toFixed(2)} ({cartItems.length})
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        
        {/* Deal Banner */}
        <div className="mb-6 overflow-hidden bg-gradient-to-r from-[#5e00a3] to-[#3c006b] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center relative gap-6 shadow-sm border border-white/5">
          <div className="z-10">
            <span className="bg-[#ff3b60] text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Mega Savings</span>
            <h2 className="text-2xl font-black mt-2 md:text-3xl leading-tight">Get Up to 40% Off on Staples!</h2>
            <p className="text-xs text-purple-100 mt-1 max-w-md font-medium">Enjoy best rates on rice, dals, ghee, and daily essentials with instant 10 mins delivery.</p>
          </div>
          <div className="flex gap-4 text-4xl select-none animate-bounce duration-1000 z-10">
            <span>🌾</span>
            <span>🥛</span>
            <span>💧</span>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none -mr-10 -mb-10">
            SHOP
          </div>
        </div>

        {/* Circular Categories Grid */}
        <div className="mb-8 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Shop by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="flex flex-col items-center gap-2 rounded-2xl min-w-[80px] transition-all hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-sm border transition-all ${
                selectedCategoryId === null ? 'bg-[#3c006b] text-white border-[#3c006b]' : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-300'
              }`}>
                🍎
              </div>
              <span className="text-[11px] font-black text-center text-slate-700">All Items</span>
            </button>
            {categories.map((category) => {
              // Select suitable emoji based on category name
              const nameLower = category.name.toLowerCase();
              let emoji = "📁";
              if (nameLower.includes("rice") || nameLower.includes("atta") || nameLower.includes("wheat")) emoji = "🌾";
              else if (nameLower.includes("oil") || nameLower.includes("ghee")) emoji = "💧";
              else if (nameLower.includes("masala") || nameLower.includes("spices")) emoji = "🌶️";
              else if (nameLower.includes("dairy") || nameLower.includes("milk") || nameLower.includes("cheese")) emoji = "🥛";
              else if (nameLower.includes("cosmetics") || nameLower.includes("personal") || nameLower.includes("hair")) emoji = "🧴";
              else if (nameLower.includes("fruits") || nameLower.includes("vegetables")) emoji = "🥦";

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="flex flex-col items-center gap-2 rounded-2xl min-w-[80px] transition-all hover:scale-105"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-sm border transition-all ${
                    selectedCategoryId === category.id ? 'bg-[#3c006b] text-white border-[#3c006b]' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                  }`}>
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{emoji}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-center text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 rounded-xl">{error}</div>}

        {/* Products Grid Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800">
            {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : "All Products"}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredProducts.length} items found
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-slate-200 bg-white py-20 rounded-3xl text-center text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-base font-black text-slate-600">No products found</p>
            <p className="text-xs mt-1">Try another category or adjust your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
