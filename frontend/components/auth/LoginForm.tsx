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
        <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mt-1">Must be at least 10 digits</p>
      </div>

      <button
        type="submit"
        disabled={loading || phone.length < 10}
        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  )
}
