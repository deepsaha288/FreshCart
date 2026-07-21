'use client'

import { useState, useRef } from 'react'

interface OTPFormProps {
  onSubmit: (otp: string) => void
  loading: boolean
}

export default function OTPForm({ onSubmit, loading }: OTPFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length === 6) {
      onSubmit(otpCode)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-center text-gray-600 mb-4">Enter the 6-digit OTP</p>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            disabled={loading}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  )
}
