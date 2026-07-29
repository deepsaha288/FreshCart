'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Zepto style header */}
      <nav className="bg-[#3c006b] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/products" className="flex items-center gap-1.5">
            <span className="font-black text-2xl tracking-tighter uppercase text-white">
              fresh<span className="text-[#ff3b60] lowercase">cart</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/15 transition border border-white/5"
            >
              👤 Profile & Orders
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Banner Section */}
        <section className="mb-8 overflow-hidden bg-gradient-to-r from-[#5e00a3] to-[#3c006b] px-6 py-8 text-white sm:px-10 sm:py-10 rounded-2xl shadow-sm border border-white/5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#ffccd5]">Instant Grocery Delivery</p>
          <h2 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl">Bring the fresh stuff home.</h2>
          <p className="mt-3 max-w-lg text-xs leading-6 text-purple-100 font-semibold sm:text-sm">Shop pantry staples, organic items, dairy, and everyday kitchen essentials in a single flash stop.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/products" className="inline-flex rounded-xl bg-[#ff3b60] hover:bg-[#e21a51] px-5 py-3 text-xs font-black text-white transition shadow-md shadow-[#ff3b60]/10 hover:scale-[1.02]">
              Browse Market →
            </Link>
            <Link href="/profile" className="inline-flex rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-3 text-xs font-black text-white transition hover:scale-[1.02]">
              View Orders
            </Link>
          </div>
        </section>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff3b60]">Quick Actions</p>
            <h2 className="mt-1 text-2xl font-black text-slate-800">What do you need?</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Link href="/profile" className="group border border-slate-200 bg-white p-5 rounded-2xl transition-all hover:border-[#3c006b]/30 hover:shadow-md">
            <span className="mb-4 block text-3xl">👤</span>
            <h3 className="text-base font-black text-slate-800">My Profile</h3>
            <p className="mt-1 text-xs text-slate-400 font-bold">Address, email, order logs</p>
          </Link>

          <Link href="/products" className="group border border-slate-200 bg-white p-5 rounded-2xl transition-all hover:border-[#3c006b]/30 hover:shadow-md">
            <span className="mb-4 block text-3xl">🛍️</span>
            <h3 className="text-base font-black text-slate-800">Shop Market</h3>
            <p className="mt-1 text-xs text-slate-400 font-bold">Browse fresh catalog items</p>
          </Link>

          <Link href="/cart" className="group border border-slate-200 bg-white p-5 rounded-2xl transition-all hover:border-[#3c006b]/30 hover:shadow-md">
            <span className="mb-4 block text-3xl">🛒</span>
            <h3 className="text-base font-black text-slate-800">My Cart</h3>
            <p className="mt-1 text-xs text-slate-400 font-bold">Review and checkout basket</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
