'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface Category {
  id: string
  name: string
  emoji?: string
  description?: string
  image_url?: string
}

interface Product {
  id: string
  name: string
  description: string
  category_id: string
  category_name: string
  price: number
  quantity_available: number
  unit: string
  image_url?: string
  is_available: boolean
  variants?: Array<{
    id: string
    size: string
    price: number
    quantity_available: number
  }>
}

interface Order {
  order_id: string
  user_id: string
  customer_name: string
  items: Array<{ product_id: string; product_name: string; price_snapshot: number; quantity: number; unit: string }>
  total_price: number
  status: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'categories' | 'products' | 'orders'>('categories')
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image_url: '' })
  const [refreshingQueue, setRefreshingQueue] = useState(false)


  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category_id: '',
    price: 0,
    quantity_available: 0,
    unit: 'kg',
    image_url: '',
    variantsStr: '',
  })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'active' | 'delivered' | 'declined' | 'all'>('active')



  // Check admin status and fetch data
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken || !localStorage.getItem('is_admin')) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const catRes = await apiClient.getCategories()
      setCategories(catRes.data)

      const prodRes = await apiClient.getProducts(1, 100)
      setProducts(prodRes.data.items)

      const orderRes = await apiClient.getAdminOrders()
      setOrders(orderRes.data.orders)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshQueue = async () => {
    setRefreshingQueue(true)
    setError('')
    try {
      const orderRes = await apiClient.getAdminOrders()
      setOrders(orderRes.data.orders)
      setMessage('Orders refreshed successfully!')
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      setError('Failed to refresh orders')
    } finally {
      setRefreshingQueue(false)
    }
  }


  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('is_admin')
    router.push('/admin/login')
  }

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    onUploaded: (imageUrl: string) => void
  ) => {
    const image = event.target.files?.[0]
    if (!image) return

    setError('')
    setUploadingImage(true)
    try {
      const response = await apiClient.uploadImage(image)
      onUploaded(response.data.image_url)
    } catch (err) {
      setError((err as any).response?.data?.detail || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  // ==================== CATEGORIES ====================
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        setError('Category name is required')
        return
      }

      const response = await apiClient.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        image_url: newCategory.image_url || undefined,
      })

      setCategories([...categories, response.data])
      setNewCategory({ name: '', description: '', image_url: '' })
      setMessage('Category created successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to create category: ' + (err as any).message)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await apiClient.deleteCategory(categoryId)
      setCategories(categories.filter((c) => c.id !== categoryId))
      setMessage('Category deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete category: ' + (err as any).message)
    }
  }

  // ==================== PRODUCTS ====================
  const parseVariantsString = (str: string) => {
    if (!str.trim()) return undefined;
    const parts = str.split(',');
    const variants = [];
    for (const part of parts) {
      const [size, priceStr, qtyStr] = part.trim().split(':');
      if (!size || !priceStr || !qtyStr) {
        throw new Error(`Invalid variant format: "${part}". Must be Size:Price:Stock`);
      }
      const price = Number(priceStr);
      const quantity_available = Number(qtyStr);
      if (isNaN(price) || isNaN(quantity_available)) {
        throw new Error(`Invalid price or stock in variant: "${part}"`);
      }
      const id = size.toLowerCase().replace(/\s+/g, '-');
      variants.push({ id, size, price, quantity_available });
    }
    return variants;
  };

  const serializeVariants = (variants?: any[]) => {
    if (!variants || variants.length === 0) return '';
    return variants.map(v => `${v.size}:${v.price}:${v.quantity_available}`).join(', ');
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name.trim() || !newProduct.category_id) {
        setError('Product name and category are required')
        return
      }
      if (newProduct.description.trim().length < 5) {
        setError('Product description must contain at least 5 characters')
        return
      }
      if (!Number.isFinite(newProduct.price) || newProduct.price <= 0) {
        setError('Product price must be greater than zero')
        return
      }
      if (!Number.isInteger(newProduct.quantity_available) || newProduct.quantity_available < 0) {
        setError('Quantity must be a whole number of zero or more')
        return
      }
      if (!newProduct.unit.trim()) {
        setError('Product unit is required')
        return
      }

      let parsedVariants = undefined;
      try {
        parsedVariants = parseVariantsString(newProduct.variantsStr);
      } catch (err: any) {
        setError(err.message);
        return;
      }

      const response = await apiClient.createProduct({
        name: newProduct.name,
        description: newProduct.description,
        category_id: newProduct.category_id,
        price: newProduct.price,
        quantity_available: newProduct.quantity_available,
        unit: newProduct.unit,
        image_url: newProduct.image_url || undefined,
        variants: parsedVariants
      } as any)

      setProducts([...products, response.data])
      setNewProduct({
        name: '',
        description: '',
        category_id: '',
        price: 0,
        quantity_available: 0,
        unit: 'kg',
        image_url: '',
        variantsStr: '',
      })
      setMessage('Product created successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to create product: ' + (err as any).message)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setEditProduct({
      ...product,
      variantsStr: serializeVariants(product.variants)
    } as any)
  }

  const handleSaveProduct = async () => {
    if (!editProduct) return
    try {
      if (!editProduct.name?.trim() || !editProduct.category_id) {
        setError('Product name and category are required')
        return
      }

      let parsedVariants = undefined;
      try {
        parsedVariants = parseVariantsString((editProduct as any).variantsStr || '');
      } catch (err: any) {
        setError(err.message);
        return;
      }

      await apiClient.updateProduct(editingProductId!, {
        name: editProduct.name,
        description: editProduct.description,
        category_id: editProduct.category_id,
        price: editProduct.price,
        quantity_available: editProduct.quantity_available,
        unit: editProduct.unit,
        image_url: editProduct.image_url || undefined,
        variants: parsedVariants
      })

      // Update local state
      setProducts(
        products.map((p) =>
          p.id === editingProductId ? { ...p, ...editProduct, variants: parsedVariants } : p
        )
      )
      setEditingProductId(null)
      setEditProduct(null)
      setMessage('Product updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update product: ' + (err as any).message)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await apiClient.deleteProduct(productId)
      setProducts(products.filter((p) => p.id !== productId))
      setMessage('Product deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete product: ' + (err as any).message)
    }
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setEditProduct(null)
  }

  const handleAcceptOrder = async (orderId: string) => {
    setPackingOrderId(orderId)
    setError('')
    try {
      const response = await apiClient.acceptOrder(orderId)
      setOrders(orders.map((order) => order.order_id === orderId ? response.data : order))
      setMessage(`Order ${orderId} accepted successfully!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to accept order: ' + (err as any).message)
    } finally {
      setPackingOrderId(null)
    }
  }

  const handleDeclineOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to decline order #${orderId}?`)) return
    setPackingOrderId(orderId)
    setError('')
    try {
      const response = await apiClient.declineOrder(orderId)
      setOrders(orders.map((order) => order.order_id === orderId ? response.data : order))
      setMessage(`Order ${orderId} declined.`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to decline order: ' + (err as any).message)
    } finally {
      setPackingOrderId(null)
    }
  }


  const handleStartPreparing = async (orderId: string) => {
    setPackingOrderId(orderId)
    setError('')
    try {
      const response = await apiClient.startPreparingOrder(orderId)
      setOrders(orders.map((order) => order.order_id === orderId ? response.data : order))
      setMessage(`Order ${orderId} marked as PREPARING!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update order: ' + (err as any).message)
    } finally {
      setPackingOrderId(null)
    }
  }

  const handleMarkOrderPacked = async (orderId: string) => {
    setPackingOrderId(orderId)
    setError('')
    try {
      const response = await apiClient.markOrderPacked(orderId)
      setOrders(orders.map((order) => order.order_id === orderId ? response.data : order))
      setMessage(`Order ${orderId} PACKED! SMS notification sent to customer.`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update order: ' + (err as any).message)
    } finally {
      setPackingOrderId(null)
    }
  }

  const handleMarkOrderDelivered = async (orderId: string) => {
    setPackingOrderId(orderId)
    setError('')
    try {
      const response = await apiClient.markOrderDelivered(orderId)
      setOrders(orders.map((order) => order.order_id === orderId ? response.data : order))
      setMessage(`Order ${orderId} DELIVERED! PDF cash memo invoice generated locally.`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to deliver order: ' + (err as any).message)
    } finally {
      setPackingOrderId(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-emerald-900">Loading workspace...</div>

  return (
    <div className="min-h-screen bg-[#f3f5f1] text-slate-900">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-black text-lime-300">FC</div>
            <div>
              <h1 className="text-base font-black tracking-wide text-slate-950">FreshCart Control</h1>
              <p className="text-xs font-medium text-slate-500">Store operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <a href="/dashboard" className="hidden text-slate-600 hover:text-emerald-800 sm:block">
              Shop view
            </a>
            <a href="/products" className="text-emerald-800 hover:text-emerald-950">
              Catalog
            </a>
            <button onClick={handleLogout} className="rounded-md border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Operations overview</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Manage the store, clearly.</h2>
          </div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="rounded-md bg-white px-3 py-2 text-slate-600 shadow-sm">{products.length} products</span>
            <span className="rounded-md bg-lime-200 px-3 py-2 text-emerald-950">{orders.filter((order) => order.status !== 'ready').length} to pack</span>
          </div>
        </div>
        {message && <div className="mb-4 border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</div>}
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}

        {/* Tabs */}
        <div className="mb-7 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
          <button
            onClick={() => setTab('categories')}
            className={`rounded-md px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
              tab === 'categories'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            📁 Categories ({categories.length})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`rounded-md px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
              tab === 'products'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            📦 Products ({products.length})
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`rounded-md px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
              tab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 Orders ({orders.filter((o) => {
              const s = (o.status || 'PLACED').toUpperCase()
              return s !== 'DELIVERED' && s !== 'DECLINED' && s !== 'CANCELLED'
            }).length} Active)
          </button>
        </div>

        {tab === 'orders' && (() => {
          const activeOrders = orders.filter((o) => {
            const s = (o.status || 'PLACED').toUpperCase()
            return s !== 'DELIVERED' && s !== 'DECLINED' && s !== 'CANCELLED'
          })

          const deliveredOrders = orders.filter((o) => (o.status || 'PLACED').toUpperCase() === 'DELIVERED')

          const declinedOrders = orders.filter((o) => {
            const s = (o.status || 'PLACED').toUpperCase()
            return s === 'DECLINED' || s === 'CANCELLED'
          })

          const displayedOrders =
            orderFilter === 'active'
              ? activeOrders
              : orderFilter === 'delivered'
              ? deliveredOrders
              : orderFilter === 'declined'
              ? declinedOrders
              : orders

          return (
            <section>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Live Order Management</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage order stages: PLACED → ACCEPTED → PREPARING → PACKED (SMS Alert) → DELIVERED (Local PDF Invoice)</p>
                </div>
                <button
                  onClick={handleRefreshQueue}
                  disabled={refreshingQueue}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  <span className={refreshingQueue ? "animate-spin text-emerald-800" : ""}>🔄</span>
                  {refreshingQueue ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* Order Filter Sub-Tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setOrderFilter('active')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    orderFilter === 'active'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ⚡ Active Orders ({activeOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    orderFilter === 'delivered'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ✅ Delivered ({deliveredOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('declined')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    orderFilter === 'declined'
                      ? 'bg-rose-700 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ✕ Declined ({declinedOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    orderFilter === 'all'
                      ? 'bg-slate-800 text-white shadow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  📋 All Orders ({orders.length})
                </button>
              </div>

              {displayedOrders.length === 0 ? (
                <div className="border border-dashed border-slate-300 bg-white py-12 text-center text-sm font-bold text-slate-500 rounded-xl">
                  {orderFilter === 'active'
                    ? 'No active orders in processing pipeline.'
                    : orderFilter === 'delivered'
                    ? 'No delivered orders yet.'
                    : orderFilter === 'declined'
                    ? 'No declined orders.'
                    : 'No customer orders yet.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedOrders.map((order) => {
                  const status = (order.status || 'PLACED').toUpperCase()
                  return (
                    <article key={order.order_id} className="border border-slate-200 bg-white p-5 shadow-sm rounded-xl transition-shadow hover:shadow-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black text-slate-950 text-base">{order.order_id}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                              status === 'PLACED' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                              status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                              status === 'PREPARING' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                              status === 'PACKED' || status === 'READY' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                              status === 'DECLINED' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                              'bg-emerald-900 text-emerald-100 border border-emerald-800'
                            }`}>
                              ● {status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">Customer: <span className="font-bold text-slate-950">{order.customer_name}</span></p>
                          <p className="text-sm text-slate-500">User Phone/ID: <span className="font-semibold text-slate-700">{order.user_id}</span></p>
                          <p className="mt-1 text-xs font-medium text-slate-400">Placed on {new Date(order.created_at).toLocaleString('en-IN')}</p>
                        </div>

                        <div className="sm:text-right flex flex-col sm:items-end gap-2">
                          <p className="text-2xl font-black text-emerald-900">₹{order.total_price.toFixed(2)}</p>

                          {/* Order Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {status === 'PLACED' && (
                              <>
                                <button
                                  onClick={() => handleAcceptOrder(order.order_id)}
                                  disabled={packingOrderId === order.order_id}
                                  className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-black text-white hover:bg-emerald-900 shadow transition flex items-center gap-1"
                                >
                                  ✓ Accept Order
                                </button>
                                <button
                                  onClick={() => handleDeclineOrder(order.order_id)}
                                  disabled={packingOrderId === order.order_id}
                                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 shadow transition flex items-center gap-1"
                                >
                                  ✕ Decline Order
                                </button>
                              </>
                            )}

                            {status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleStartPreparing(order.order_id)}
                                disabled={packingOrderId === order.order_id}
                                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-700 shadow transition"
                              >
                                Start Preparing
                              </button>
                            )}

                            {(status === 'ACCEPTED' || status === 'PREPARING') && (
                              <button
                                onClick={() => handleMarkOrderPacked(order.order_id)}
                                disabled={packingOrderId === order.order_id}
                                className="rounded-lg bg-purple-700 px-4 py-2 text-xs font-black text-white hover:bg-purple-800 shadow transition"
                              >
                                📱 Mark Packing Done (SMS Alert)
                              </button>
                            )}

                            {(status === 'PACKED' || status === 'READY') && (
                              <button
                                onClick={() => handleMarkOrderDelivered(order.order_id)}
                                disabled={packingOrderId === order.order_id}
                                className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 shadow transition"
                              >
                                📄 Mark as Delivered (Generate PDF)
                              </button>
                            )}

                            {status === 'DELIVERED' && (
                              <a
                                href={apiClient.getInvoiceUrl(order.order_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 text-xs font-black hover:bg-emerald-200 transition"
                              >
                                📥 Download Invoice PDF
                              </a>
                            )}

                            {status === 'DECLINED' && (
                              <span className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-extrabold">
                                ✕ Order Declined by Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Items Ordered</p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {order.items.map((item) => <li key={item.product_id}>{item.product_name} <span className="text-slate-400">× {item.quantity} {item.unit} · ₹{(item.price_snapshot * item.quantity).toFixed(2)}</span></li>)}
                        </ul>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )
      })()}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Category Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Add New Category</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name (e.g., Rice & Atta)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded h-16"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => handleImageUpload(event, (imageUrl) => setNewCategory({ ...newCategory, image_url: imageUrl }))}
                    disabled={uploadingImage}
                    className="w-full text-sm text-gray-600"
                  />
                  {uploadingImage && <p className="mt-2 text-sm text-green-700">Uploading image...</p>}
                  <input
                    type="url"
                    placeholder="Or paste an image URL"
                    value={newCategory.image_url}
                    onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border rounded"
                  />
                  {newCategory.image_url && (
                    <div className="mt-3 w-full h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={newCategory.image_url} alt="Preview" className="max-h-full max-w-full object-cover" onError={() => setError('Invalid image URL')} />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 font-bold text-sm"
                >
                  Create Category
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold mb-4">Existing Categories</h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between bg-white p-4 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center font-black text-slate-600">📁</div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Product Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Add New Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded h-16"
                />
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Quantity Available"
                  value={newProduct.quantity_available}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity_available: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
                 <input
                  type="text"
                  placeholder="Unit (kg, litre, dozen, etc)"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <div>
                  <input
                    type="text"
                    placeholder="Variants (e.g. 50g:20:100, 1kg:320:15)"
                    value={newProduct.variantsStr}
                    onChange={(e) => setNewProduct({ ...newProduct, variantsStr: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Optional. Format: Size:Price:Stock (separated by commas)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => handleImageUpload(event, (imageUrl) => setNewProduct({ ...newProduct, image_url: imageUrl }))}
                    disabled={uploadingImage}
                    className="w-full text-sm text-gray-600"
                  />
                  {uploadingImage && <p className="mt-2 text-sm text-green-700">Uploading image...</p>}
                  <input
                    type="url"
                    placeholder="Or paste an image URL"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border rounded"
                  />
                  {newProduct.image_url && (
                    <div className="mt-3 w-full h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={newProduct.image_url} alt="Product preview" className="max-h-full max-w-full object-cover" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={uploadingImage}
                  className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
                >
                  Create Product
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold mb-4">Existing Products</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded border">
                    {editingProductId === product.id && editProduct ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editProduct.name || ''}
                          onChange={(event) => setEditProduct({ ...editProduct, name: event.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                        <textarea
                          value={editProduct.description || ''}
                          onChange={(event) => setEditProduct({ ...editProduct, description: event.target.value })}
                          className="w-full px-3 py-2 border rounded h-16"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={editProduct.price ?? 0}
                            onChange={(event) => setEditProduct({ ...editProduct, price: Number(event.target.value) })}
                            className="w-full px-3 py-2 border rounded"
                            step="0.01"
                          />
                           <input
                            type="number"
                            value={editProduct.quantity_available ?? 0}
                            onChange={(event) => setEditProduct({ ...editProduct, quantity_available: Number(event.target.value) })}
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Variants (e.g. 50g:20:100, 1kg:320:15)"
                            value={(editProduct as any).variantsStr || ''}
                            onChange={(event) => setEditProduct({ ...editProduct, variantsStr: event.target.value } as any)}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Optional. Format: Size:Price:Stock (separated by commas)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(event) => handleImageUpload(event, (imageUrl) => setEditProduct({ ...editProduct, image_url: imageUrl }))}
                          disabled={uploadingImage}
                          className="w-full text-sm text-gray-600"
                        />
                        {editProduct.image_url && (
                          <img src={editProduct.image_url} alt="Product preview" className="h-20 w-20 rounded object-cover" />
                        )}
                        <div className="flex gap-3">
                          <button onClick={handleSaveProduct} disabled={uploadingImage} className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800">
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="border px-3 py-2 rounded hover:bg-gray-50">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {product.image_url && <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded object-cover" />}
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category_name} • ₹{product.price} / {product.unit} • Qty: {product.quantity_available}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => handleEditProduct(product)} className="text-green-700 hover:text-green-900 font-medium text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
