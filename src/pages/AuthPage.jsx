import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AtSign, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', username: '', fullName: '' })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn({ email: form.email, password: form.password })
        if (error) throw error
        navigate('/')
      } else {
        if (!form.username.trim()) throw new Error('Username is required')
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        const { error } = await signUp({
          email: form.email,
          password: form.password,
          username: form.username.trim(),
          fullName: form.fullName.trim(),
        })
        if (error) throw error
        setSuccess('Account created! Please check your email to confirm, then log in.')
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setSuccess(null)
    setForm({ email: '', password: '', username: '', fullName: '' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-accent-500 to-pink-500 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 11}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">SocialSpark</h1>
          <p className="text-xl text-white/90 font-light max-w-xs">
            Connect with friends, share your moments, discover inspiring stories.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {['Share', 'Connect', 'Inspire'].map(word => (
              <div key={word} className="bg-white/20 backdrop-blur rounded-2xl py-3 px-4 text-center">
                <p className="font-semibold text-sm">{word}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-extrabold gradient-text">SocialSpark</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome back! 👋' : 'Join SocialSpark ✨'}
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => isLogin || switchMode()}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => !isLogin || switchMode()}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="input-field pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-100">
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" /> {isLogin ? 'Signing in...' : 'Creating account...'}</> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-primary-600 font-semibold hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
