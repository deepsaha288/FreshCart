'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string }
}) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.getOrder(params.orderId)
        setOrder(response.data)
      } catch (err: any) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    const statusTimer = window.setInterval(fetchOrder, 8000)
    return () => window.clearInterval(statusTimer)
  }, [params.orderId])

  const renderStatusStepper = (status: string) => {
    const stages = ['PLACED', 'ACCEPTED', 'PREPARING', 'PACKED', 'DELIVERED']
    const currentStatus = status?.toUpperCase() === 'READY' ? 'PACKED' : status?.toUpperCase() || 'PLACED'
    const currentIndex = stages.indexOf(currentStatus)

    return (
      <div className="my-6">
        <div className="flex items-center justify-between text-xs font-bold">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex
            const isCurrent = idx === currentIndex
            return (
              <div key={stage} className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                      : isCompleted
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] text-center font-bold uppercase tracking-tight ${isCurrent ? 'text-emerald-950 font-black' : isCompleted ? 'text-emerald-800' : 'text-slate-400'}`}>
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
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600 font-bold text-sm">Loading order tracking...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-black text-rose-600 mb-4">Order Error</h1>
          <p className="text-slate-600 font-bold text-sm mb-6">{error || 'Order not found'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-900 shadow"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = (order.status || 'PLACED').toUpperCase()

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <nav className="bg-[#1B4332] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-emerald-100 hover:text-white font-bold text-sm">
            ← Back to Dashboard
          </Link>
          <Link href="/profile" className="text-lime-300 font-black text-sm">
            My Profile & Orders
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 mb-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-3">
            ✅
          </div>
          <h1 className="text-3xl font-black text-slate-950 mb-1">Order Placed Successfully!</h1>
          <p className="text-slate-500 font-medium text-sm">Your order #{order.order_id} is being processed.</p>

          {/* Stepper */}
          {renderStatusStepper(order.status)}
        </div>

        {/* SMS Notification Banner when PACKED */}
        {(currentStatus === 'PACKED' || currentStatus === 'READY') && (
          <div className="mb-6 bg-purple-50 border border-purple-300 p-5 rounded-2xl shadow-sm text-center">
            <div className="text-3xl mb-1">📱</div>
            <h3 className="text-lg font-black text-purple-950">Packing Complete — SMS Sent!</h3>
            <p className="text-xs font-bold text-purple-800 mt-1">
              SMS sent to your registered phone number: "Your order #{order.order_id} is packed and ready!"
            </p>
          </div>
        )}

        {/* Download Invoice Banner when DELIVERED */}
        {currentStatus === 'DELIVERED' && (
          <div className="mb-6 bg-emerald-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-black text-white">Order Delivered & Invoice Ready</h3>
              <p className="text-xs font-medium text-emerald-200 mt-1">Download your official cash memo PDF invoice.</p>
            </div>
            <a
              href={apiClient.getInvoiceUrl(order.order_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-lime-400 hover:bg-lime-300 text-emerald-950 px-5 py-2.5 rounded-xl font-black text-sm shadow transition"
            >
              📥 Download Invoice PDF
            </a>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Order ID</p>
              <p className="text-lg font-black text-emerald-950">{order.order_id}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-lg font-black text-slate-950">₹{order.total_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Status</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                {currentStatus}
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Placed At</p>
              <p className="text-xs font-bold text-slate-700 mt-1">
                {new Date(order.created_at).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Items */}
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Order Items</h3>
          <div className="divide-y divide-slate-100 bg-[#F7F9F7] rounded-xl p-4 border border-slate-200/60 mb-6">
            {order.items.map((item: any) => (
              <div key={item.product_id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-slate-950">{item.product_name}</p>
                  <p className="text-slate-500 text-xs font-semibold">
                    {item.quantity} {item.unit} × ₹{item.price_snapshot.toFixed(2)}
                  </p>
                </div>
                <p className="font-black text-slate-950">₹{(item.price_snapshot * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Customer info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Customer</p>
            <p className="text-sm font-bold text-slate-950">{order.customer_name}</p>
            <p className="text-xs text-slate-500">User ID/Phone: {order.user_id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/profile"
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white py-3 rounded-xl font-extrabold text-sm text-center shadow transition"
          >
            Go to My Profile & Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 py-3 rounded-xl font-extrabold text-sm text-center shadow-sm transition"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  )
}
