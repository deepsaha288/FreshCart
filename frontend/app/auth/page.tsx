'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import OTPForm from '@/components/auth/OTPForm'

export default function AuthPage() {
  const router = useRouter()
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      })

      if (response.ok) {
        setShowOTP(true)
      } else {
        const data = await response.json()
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
    <div className="min-h-screen bg-gradient-to-br from-primary to-green-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">FreshCart</h1>
          <p className="text-center text-gray-500 mb-6">Fresh Grocery Online</p>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setAuthMethod('phone')
                setShowOTP(false)
                setError('')
              }}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                authMethod === 'phone'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📱 Phone OTP
            </button>
            <button
              onClick={() => {
                setAuthMethod('email')
                setError('')
              }}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                authMethod === 'email'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✉️ Email
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          {authMethod === 'phone' ? (
            <>
              {!showOTP ? (
                <LoginForm onSubmit={handlePhoneSubmit} loading={loading} />
              ) : (
                <OTPForm onSubmit={handleOTPSubmit} loading={loading} />
              )}
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : isRegistering ? 'Create Account' : 'Login'}
              </button>

              <div className="text-center text-sm text-gray-600">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-green-700 font-semibold hover:underline"
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
