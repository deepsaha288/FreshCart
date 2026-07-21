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
    <div className="min-h-screen bg-[#F7F9F7]">
      <nav className="border-b border-emerald-950/10 bg-[#f6f7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 font-black text-lime-200">F</div>
            <div>
              <h1 className="text-lg font-black tracking-wide text-emerald-950">FreshCart</h1>
              <p className="text-xs font-medium text-emerald-800/70">Fresh groceries, simply</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-md bg-emerald-900 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
            >
              👤 Profile & Orders
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <section className="mb-8 overflow-hidden bg-emerald-900 px-6 py-8 text-white sm:px-10 sm:py-10 rounded-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-lime-200">Today&apos;s market</p>
          <h2 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl">Bring the good stuff home.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100 sm:text-base">Shop pantry staples, fresh dairy, spices, and everyday essentials in one quick stop.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/products" className="inline-flex rounded-xl bg-lime-300 px-5 py-3 text-sm font-black text-emerald-950 transition-colors hover:bg-lime-200 shadow">
              Browse Market →
            </Link>
            <Link href="/profile" className="inline-flex rounded-xl bg-emerald-800 border border-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
              View Profile & Orders
            </Link>
          </div>
        </section>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-800">Quick actions</p>
            <h2 className="mt-1 text-2xl font-black text-emerald-950">What do you need?</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Link href="/profile" className="group border border-emerald-950/10 bg-white p-5 rounded-2xl transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md">
            <span className="mb-4 block text-3xl">👤</span>
            <h3 className="text-lg font-black text-emerald-950">My Profile</h3>
            <p className="mt-1 text-xs text-emerald-950/60 font-medium">Name, email, order history</p>
          </Link>

          <Link href="/products" className="group border border-emerald-950/10 bg-white p-5 rounded-2xl transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md">
            <span className="mb-4 block text-3xl">🛍️</span>
            <h3 className="text-lg font-black text-emerald-950">Shop</h3>
            <p className="mt-1 text-xs text-emerald-950/60 font-medium">Browse fresh products</p>
          </Link>

          <Link href="/cart" className="group border border-emerald-950/10 bg-white p-5 rounded-2xl transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md">
            <span className="mb-4 block text-3xl">🛒</span>
            <h3 className="text-lg font-black text-emerald-950">Cart</h3>
            <p className="mt-1 text-xs text-emerald-950/60 font-medium">Review your basket</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
