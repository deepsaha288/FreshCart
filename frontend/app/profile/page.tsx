'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { User } from '@/types'

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
  customer_name: str
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
  const { user, setUser, logout, isAuthenticated, hydrate } = useAuthStore()

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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">● PLACED</span>
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">● ACCEPTED</span>
      case 'PREPARING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">● PREPARING</span>
      case 'PACKED':
      case 'READY':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">📦 PACKED (SMS Sent)</span>
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-900 text-emerald-100 border border-emerald-800">✓ DELIVERED</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>
    }
  }

  const renderStatusStepper = (status: string) => {
    const stages = ['PLACED', 'ACCEPTED', 'PREPARING', 'PACKED', 'DELIVERED']
    const currentStatus = status.toUpperCase() === 'READY' ? 'PACKED' : status.toUpperCase()
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
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                      : isCompleted
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] text-center font-bold tracking-tight ${isCurrent ? 'text-emerald-900' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
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
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-900 font-bold text-base">
          <div className="w-6 h-6 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          Loading your profile...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-slate-900">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-lime-400 text-emerald-950 rounded-xl flex items-center justify-center text-xl font-black shadow-inner">
              🛒
            </div>
            <span className="text-xl font-black tracking-tight text-white">FreshCart</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/dashboard" className="text-emerald-100 hover:text-white transition">
              Home
            </Link>
            <Link href="/products" className="text-emerald-100 hover:text-white transition">
              Shop
            </Link>
            <button
              onClick={handleLogout}
              className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-300/30 text-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {message && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <span>✅</span> {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-3xl font-black rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/10">
              {(user?.name || user?.phone || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                  {user?.name || 'FreshCart Customer'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  Verified Member
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                <span>📞 {user?.phone || 'No phone set'}</span>
                <span>✉️ {user?.email || 'No email registered'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-initial bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm"
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-initial bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-5 py-2.5 rounded-xl font-bold text-sm transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Edit Profile Form Modal / Box */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl border border-emerald-200 p-6 mb-8 shadow-md">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2 rounded-xl text-sm font-bold transition shadow"
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
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📦 Order History ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap ${
              activeTab === 'cart'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🛒 My Cart ({cartItems.length} items)
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-900 text-white shadow'
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
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-black text-slate-900 mb-1">No Orders Placed Yet</h3>
                <p className="text-slate-500 text-sm mb-5">Browse our fresh grocery catalog and place your first order.</p>
                <Link
                  href="/products"
                  className="inline-block bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow"
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
                        <p className="text-2xl font-black text-emerald-900">₹{order.total_price.toFixed(2)}</p>
                      </div>

                      {/* Download Invoice Button */}
                      <a
                        href={apiClient.getInvoiceUrl(order.order_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm"
                      >
                        📥 Download Invoice
                      </a>
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  {renderStatusStepper(order.status)}

                  {/* SMS Alert Badge if PACKED */}
                  {(order.status.toUpperCase() === 'PACKED' || order.status.toUpperCase() === 'READY') && (
                    <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span>📱</span>
                      <span>SMS Sent: Your order has been packed and is ready for pickup/delivery!</span>
                    </div>
                  )}

                  {/* Order Items Breakdown */}
                  <div className="mt-4 bg-[#F7F9F7] rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Items Ordered</p>
                    <div className="divide-y divide-slate-200/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-900">
                            {item.product_name} <span className="text-slate-500 text-xs font-semibold">× {item.quantity} {item.unit}</span>
                          </span>
                          <span className="font-extrabold text-slate-900">
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
                  className="inline-block bg-emerald-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-900 transition"
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
                        <h4 className="font-bold text-slate-950 text-sm">{item.product_name}</h4>
                        <p className="text-xs text-slate-500">₹{item.price_snapshot} per {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-extrabold bg-slate-100 px-3 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-black text-emerald-900 text-base">
                          ₹{(item.price_snapshot * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
                    <p className="text-2xl font-black text-emerald-950">₹{cartTotal.toFixed(2)}</p>
                  </div>
                  <Link
                    href="/checkout"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow transition"
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
              <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">User ID / Phone</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.phone || user?.id}</p>
              </div>

              <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Full Name</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.name || 'Not specified'}</p>
              </div>

              <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Email (Invoice Delivery)</span>
                <p className="text-base font-bold text-slate-950 mt-1">{user?.email || 'Not specified'}</p>
              </div>

              <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Verification Status</span>
                <p className="text-base font-bold text-emerald-800 mt-1">✓ Verified Account</p>
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
