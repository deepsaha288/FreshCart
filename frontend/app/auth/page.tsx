'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import OTPForm from '@/components/auth/OTPForm'

export default function AuthPage() {
  const router = useRouter()
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [testOtp, setTestOtp] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  
  const handlePhoneSubmit = async (phoneNumber: string) => {
    setPhone(phoneNumber)
    setLoading(true)
    setError('')
    setTestOtp('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      })
      
      const data = await response.json()
      if (response.ok) {
        if (data.otp_for_testing) {
          setTestOtp(data.otp_for_testing)
        }
        setShowOTP(true)
      } else {
        setError(data.detail || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (otp: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.tokens.access_token)
        localStorage.setItem('refresh_token', data.tokens.refresh_token)
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.detail || 'Invalid OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isRegistering ? 'register-email' : 'login-email'
      const body = isRegistering
        ? { email, password, name: email.split('@')[0] }
        : { email, password }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.tokens.access_token)
        localStorage.setItem('refresh_token', data.tokens.refresh_token)
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.detail || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3c006b] to-[#5e00a3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <span className="font-black text-4xl tracking-tighter uppercase text-[#3c006b] inline-block">
              fresh<span className="text-[#ff3b60] lowercase">cart</span>
            </span>
            <p className="text-slate-500 font-bold text-xs mt-1">10-Minute Grocery Delivery</p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setAuthMethod('phone')
                setShowOTP(false)
                setError('')
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                authMethod === 'phone'
                  ? 'bg-[#3c006b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📱 Phone OTP
            </button>
            <button
              onClick={() => {
                setAuthMethod('email')
                setError('')
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                authMethod === 'email'
                  ? 'bg-[#3c006b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✉️ Email
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {authMethod === 'phone' ? (
            <>
              {!showOTP ? (
                <LoginForm onSubmit={handlePhoneSubmit} loading={loading} />
              ) : (
                <>
                  <OTPForm onSubmit={handleOTPSubmit} loading={loading} />
                  {testOtp && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-2xl text-center shadow-sm select-none">
                      🔧 Dev Mode: Your verification code is <span className="underline font-mono text-sm tracking-wider text-[#3c006b] font-black">{testOtp}</span>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#3c006b] focus:ring-2 focus:ring-[#ffccd5]/50 font-semibold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#3c006b] focus:ring-2 focus:ring-[#ffccd5]/50 font-semibold text-sm"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3c006b] hover:bg-[#5e00a3] text-white py-3 rounded-xl font-black transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-[#3c006b]/10 active:scale-98 text-sm"
              >
                {loading ? 'Loading...' : isRegistering ? 'Create Account' : 'Login'}
              </button>

              <div className="text-center text-xs text-slate-500 font-bold mt-4">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[#ff3b60] font-black hover:underline"
                >
                  {isRegistering ? 'Login' : 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
