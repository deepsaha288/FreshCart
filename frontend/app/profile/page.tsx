'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'

interface OrderItem {
  product_id: string
  product_name: string
  price_snapshot: number
  quantity: number
  unit: string
}

interface Order {
  order_id: string
  user_id: string
  customer_name: string
  items: OrderItem[]
  total_price: number
  status: string
  invoice_url?: string
  created_at: string
}

interface CartItem {
  product_id: string
  product_name: string
  price_snapshot: number
  quantity: number
  unit: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout, hydrate } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'cart'>('orders')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch Current User
      const userRes = await apiClient.getCurrentUser()
      setUser(userRes.data)
      setEditName(userRes.data.name || '')
      setEditEmail(userRes.data.email || '')
      setEditPhone(userRes.data.phone || userRes.data.id || '')

      // Fetch User Orders
      const ordersRes = await apiClient.getMyOrders()
      setOrders(ordersRes.data.orders || [])

      // Fetch User Cart
      const cartRes = await apiClient.getCart()
      setCartItems(cartRes.data.items || [])
      setCartTotal(cartRes.data.total_price || 0)
    } catch (err: any) {
      console.error('Failed to load profile data:', err)
      setError('Failed to load profile data. Please check your login session.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setMessage('')
    setError('')
    try {
      const res = await apiClient.updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
      })
      setUser(res.data)
      setIsEditing(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (e) {
      // Ignore logout API errors
    } finally {
      logout()
      router.push('/auth')
    }
  }

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase()
    switch (s) {
      case 'PLACED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">● PLACED</span>
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">● ACCEPTED</span>
      case 'PREPARING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">● PREPARING</span>
      case 'PACKED':
      case 'READY':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">📦 PACKED (SMS Sent)</span>
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white border border-emerald-500">✓ DELIVERED</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600">{status}</span>
    }
  }

  const renderStatusStepper = (status: string) => {
    const stages = ['PLACED', 'ACCEPTED', 'PREPARING', 'PACKED', 'DELIVERED']
    const currentStatus = status.toUpperCase() === 'READY' ? 'PACKED' : status.toUpperCase()
    if (currentStatus === 'DECLINED') {
      return (
        <div className="my-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>✕ Order Declined by Store Admin</span>
          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-black uppercase">Declined</span>
        </div>
      )
    }

    const currentIndex = stages.indexOf(currentStatus)

    return (
      <div className="my-4 pt-2 pb-1">
        <div className="flex items-center justify-between text-xs font-bold">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex
            const isCurrent = idx === currentIndex
            return (
              <div key={stage} className="flex flex-col items-center gap-1 flex-1 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-all ${
                    isCurrent
                      ? 'bg-[#3c006b] text-white ring-4 ring-[#ffccd5] scale-110'
                      : isCompleted
                      ? 'bg-[#5e00a3] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] text-center font-bold tracking-tight ${isCurrent ? 'text-[#3c006b]' : isCompleted ? 'text-[#5e00a3]' : 'text-slate-400'}`}>
                  {stage}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#3c006b] font-bold text-base">
          <div className="w-6 h-6 border-3 border-[#3c006b] border-t-transparent rounded-full animate-spin"></div>
          Loading your profile...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      {/* Header Bar */}
      <header className="bg-[#3c006b] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-black text-2xl tracking-tighter uppercase text-white">
              fresh<span className="text-[#ff3b60] lowercase">cart</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-black">
            <Link href="/dashboard" className="text-white/80 hover:text-white transition">
              Home
            </Link>
            <Link href="/products" className="text-white/80 hover:text-white transition">
              Shop
            </Link>
            <button
              onClick={handleLogout}
              className="bg-rose-500/20 hover:bg-rose-500/40 border border-rose-300/25 text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {message && (
          <div className="mb-6 bg-[#ffccd5]/30 border border-[#ffccd5] text-[#3c006b] px-4 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <span>✅</span> {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5e00a3] to-[#3c006b] text-white text-3xl font-black rounded-2xl flex items-center justify-center shadow-lg shadow-[#3c006b]/10">
              {(user?.name || user?.phone || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {user?.name || 'FreshCart Customer'}
                </h1>
                <span className="bg-[#ffccd5] text-[#3c006b] text-xs font-black px-2.5 py-0.5 rounded-full">
                  Verified Member
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-4 flex-wrap">
                <span>📞 {user?.phone || 'No phone set'}</span>
                <span>✉️ {user?.email || 'No email registered'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs transition shadow-sm"
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-initial bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-5 py-2.5 rounded-xl font-black text-xs transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Edit Profile Form Modal / Box */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl border border-[#ffccd5] p-6 mb-8 shadow-sm">
            <h2 className="text-base font-black text-[#3c006b] mb-4 flex items-center gap-2">
              <span>👤</span> Edit Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#ffccd5]/50 focus:border-[#3c006b] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#ffccd5]/50 focus:border-[#3c006b] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#ffccd5]/50 focus:border-[#3c006b] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-[#3c006b] hover:bg-[#5e00a3] text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-md shadow-[#3c006b]/10"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex gap-3 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#3c006b] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📦 Order History ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap ${
              activeTab === 'cart'
                ? 'bg-[#3c006b] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🛒 My Cart ({cartItems.length} items)
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#3c006b] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ⚙️ Profile Info
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <section className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-black text-slate-900 mb-1">No Orders Placed Yet</h3>
                <p className="text-slate-500 text-sm mb-5">Browse our fresh grocery catalog and place your first order.</p>
                <Link
                  href="/products"
                  className="inline-block bg-[#3c006b] hover:bg-[#5e00a3] text-white px-6 py-2.5 rounded-xl font-black text-xs transition shadow-md shadow-[#3c006b]/10"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <article
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-black text-lg text-slate-950">{order.order_id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Placed on {new Date(order.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</p>
                        <p className="text-2xl font-black text-[#3c006b]">₹{order.total_price.toFixed(2)}</p>
                      </div>

                      {/* Download Invoice Button */}
                      <a
                        href={apiClient.getInvoiceUrl(order.order_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-[#3c006b] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm"
                      >
                        📥 Download Invoice
                      </a>
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  {renderStatusStepper(order.status)}

                  {/* SMS Alert Badge if PACKED */}
                  {(order.status.toUpperCase() === 'PACKED' || order.status.toUpperCase() === 'READY') && (
                    <div className="mb-4 bg-purple-50 border border-[#ffccd5] text-[#3c006b] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span>📱</span>
                      <span>SMS Sent: Your order has been packed and is ready for pickup/delivery!</span>
                    </div>
                  )}

                  {/* Order Items Breakdown */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Items Ordered</p>
                    <div className="divide-y divide-slate-200/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-800">
                            {item.product_name} <span className="text-slate-400 text-xs font-semibold">× {item.quantity} {item.unit}</span>
                          </span>
                          <span className="font-black text-slate-800">
                            ₹{(item.price_snapshot * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* TAB 2: MY CART */}
        {activeTab === 'cart' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950 mb-4 flex items-center gap-2">
              <span>🛒</span> Shopping Cart Overview
            </h2>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-slate-500 font-bold text-sm mb-4">Your cart is currently empty.</p>
                <Link
                  href="/products"
                  className="inline-block bg-[#3c006b] hover:bg-[#5e00a3] text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div>
                <div className="divide-y divide-slate-100 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="py-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.product_name}</h4>
                        <p className="text-xs text-slate-400">₹{item.price_snapshot} per {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-extrabold bg-slate-100 px-3 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-black text-slate-800 text-base">
                          ₹{(item.price_snapshot * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
                    <p className="text-2xl font-black text-[#3c006b]">₹{cartTotal.toFixed(2)}</p>
                  </div>
                  <Link
                    href="/checkout"
                    className="bg-[#3c006b] hover:bg-[#5e00a3] text-white px-6 py-3 rounded-xl font-black text-sm shadow transition"
                  >
                    Proceed to Checkout →
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PROFILE INFO DETAILS */}
        {activeTab === 'profile' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-2">
              <span>📋</span> User Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">User ID / Phone</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.phone || user?.id}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Full Name</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.name || 'Not specified'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Email (Invoice Delivery)</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.email || 'Not specified'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Verification Status</span>
                <p className="text-base font-bold text-emerald-600 mt-1">✓ Verified Account</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
            >
              Edit Information
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
