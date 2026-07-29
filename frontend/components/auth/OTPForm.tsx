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
      <p className="text-center text-slate-600 mb-4 font-semibold text-sm">Enter the 6-digit OTP sent to your phone</p>

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
            className="w-12 h-12 text-center text-xl font-bold border border-slate-200 rounded-xl outline-none focus:border-[#3c006b] focus:ring-2 focus:ring-[#ffccd5]/50"
            disabled={loading}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-[#3c006b] hover:bg-[#5e00a3] text-white py-3 rounded-xl font-black transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-[#3c006b]/10 active:scale-98 text-sm"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  )
}
