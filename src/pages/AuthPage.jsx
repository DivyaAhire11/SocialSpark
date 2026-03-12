import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AtSign, LayoutGrid } from 'lucide-react'
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

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
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gray-900 relative overflow-hidden flex-col items-start justify-between p-12">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SocialSpark</span>
        </div>

        {/* Testimonial / tagline area */}
        <div className="relative z-10">
          <p className="text-2xl font-bold text-white leading-snug max-w-xs mb-4">
            Connect. Share. Inspire.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            A professional social platform to share moments, grow your network, and stay connected with people that matter.
          </p>
          <div className="mt-8 flex gap-2">
            {['Share', 'Connect', 'Inspire'].map(word => (
              <div key={word} className="bg-white/10 border border-white/10 rounded-lg py-1.5 px-3">
                <p className="font-medium text-white text-xs">{word}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">© 2026 SocialSpark</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <LayoutGrid size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SocialSpark</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? 'Welcome back. Enter your details.' : 'Fill in your information to get started.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => isLogin || switchMode()}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign in
            </button>
            <button
              onClick={() => !isLogin || switchMode()}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="fullName" value={form.fullName}
                    onChange={handleChange} placeholder="Full name"
                    className="input-field pl-10" />
                </div>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="username" value={form.username}
                    onChange={handleChange} placeholder="Username"
                    className="input-field pl-10" required />
                </div>
              </>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="Email address"
                className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password" value={form.password}
                onChange={handleChange} placeholder="Password"
                className="input-field pl-10 pr-10" required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-3.5 py-2.5 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm mt-1"
            >
              {loading
                ? <><Spinner size="sm" /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
                : isLogin ? 'Sign in' : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
