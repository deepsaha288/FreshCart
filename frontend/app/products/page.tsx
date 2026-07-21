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
      <div className="min-h-screen bg-[#f6f7f2] flex items-center justify-center">
        <div className="text-sm font-bold text-emerald-900">Loading products market...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <nav className="sticky top-0 z-10 border-b border-emerald-950/10 bg-[#f6f7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-emerald-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 font-black text-lime-200">F</span>
            <span className="font-black tracking-wide text-lg">FreshCart</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-xs font-bold text-emerald-900 hover:text-emerald-950 transition hidden sm:inline"
            >
              👤 Profile
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 shadow transition"
            >
              🛒 My Cart ({cartItems.length})
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-7 flex flex-col gap-5 border-b border-emerald-950/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-800">FreshCart Grocery</p>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Fresh groceries, made easy.</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-emerald-950/70">
              {products.length} items available
            </span>
            <Link
              href="/cart"
              className="bg-lime-300 hover:bg-lime-200 text-emerald-950 px-3.5 py-1.5 rounded-lg text-xs font-black transition shadow-sm"
            >
              View Cart →
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search rice, oil, milk, spices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-sm font-medium text-emerald-950 outline-none placeholder:text-emerald-950/40 focus:border-emerald-700 focus:ring-2 focus:ring-lime-300/60 shadow-sm"
          />
        </div>

        {/* Category Chips */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-2">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === null
                  ? 'bg-emerald-900 text-white shadow'
                  : 'bg-white text-emerald-950 border border-emerald-950/15 hover:border-emerald-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategoryId === category.id
                    ? 'bg-emerald-900 text-white shadow'
                    : 'bg-white text-emerald-950 border border-emerald-950/15 hover:border-emerald-700'
                }`}
              >
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="w-5 h-5 rounded object-cover" />
                ) : (
                  <span>📁</span>
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 rounded-xl">{error}</div>}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-emerald-950/20 bg-white py-14 rounded-2xl text-center text-emerald-950/60">
            <p className="text-lg font-bold">No products found</p>
            <p className="mt-1 text-sm">Try another category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Product Count */}
        <div className="mt-8 text-center text-sm font-medium text-emerald-950/55">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </main>
    </div>
  )
}
