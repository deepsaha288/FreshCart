'use client'

import { useState } from 'react'

interface LoginFormProps {
  onSubmit: (phone: string) => void
  loading: boolean
}

export default function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 10) {
      onSubmit(phone)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-slate-800 font-bold mb-2 text-sm">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#3c006b] focus:ring-2 focus:ring-[#ffccd5]/50 font-semibold"
          disabled={loading}
        />
        <p className="text-xs text-slate-400 font-medium mt-1">Must be at least 10 digits (e.g. +919999999999)</p>
      </div>

      <button
        type="submit"
        disabled={loading || phone.length < 10}
        className="w-full bg-[#3c006b] hover:bg-[#5e00a3] text-white py-3 rounded-xl font-black transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-[#3c006b]/10 active:scale-98 text-sm"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  )
}
