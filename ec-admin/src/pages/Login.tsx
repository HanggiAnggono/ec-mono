import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, signup, error, clearError } = useAuth()
  
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')

  const handleTabChange = (signUp: boolean) => {
    setIsSignUp(signUp)
    clearError()
    setLocalError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!username || !password) {
      setLocalError('Username and password are required.')
      return
    }

    if (isSignUp) {
      if (!email || !phone) {
        setLocalError('Email and phone number are required for signing up.')
        return
      }
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await signup({
          username,
          email,
          password,
          phone,
          firstname,
          lastname,
        })
      } else {
        await login(username, password)
      }
      navigate('/', { replace: true })
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(158,176,255,0.16),_transparent_35%),linear-gradient(180deg,_#0b1020_0%,_#090e1b_100%)] text-[var(--text)] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      
      <div className="relative w-full max-w-[480px] bg-[rgba(20,27,46,0.8)] border border-[var(--line-strong)] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl px-6 py-8 sm:px-10 sm:py-10 transition duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-[2.5rem] font-bold tracking-[-0.04em] text-[var(--accent)]">
            Neon Market
          </h1>
          <p className="font-mono mt-2 text-xs uppercase tracking-[0.3em] text-[#cfd8ff]">
            Admin Console
          </p>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#080d1a] border border-[var(--line)] rounded-[20px] mb-8">
          <button
            type="button"
            onClick={() => handleTabChange(false)}
            className={`py-3 rounded-[16px] text-sm font-semibold transition-all duration-200 cursor-pointer ${
              !isSignUp
                ? 'bg-[rgba(167,180,255,0.15)] text-[#d6ddff] border border-[rgba(255,255,255,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange(true)}
            className={`py-3 rounded-[16px] text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isSignUp
                ? 'bg-[rgba(167,180,255,0.15)] text-[#d6ddff] border border-[rgba(255,255,255,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {displayError && (
          <div className="mb-6 p-4 rounded-[18px] border border-[#f2a5a9] bg-[rgba(242,165,169,0.08)] text-[#ffc4ca] text-sm leading-relaxed">
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            required
            disabled={loading}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="enter your username"
            icon={
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            }
          />

          {isSignUp && (
            <>
              <Input
                label="Email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
              />
              
              <Input
                label="Phone"
                type="tel"
                required
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62xxxxxxxxx"
                icon={
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  disabled={loading}
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  type="text"
                  disabled={loading}
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </>
          )}

          <Input
            label="Password"
            type="password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 px-6 rounded-[18px] border border-[var(--line-strong)] bg-[#cad3ff] hover:bg-[#b0bdff] text-[#090e1b] font-semibold text-base transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 cursor-pointer shadow-[0_4px_20px_rgba(202,211,255,0.25)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#090e1b]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
