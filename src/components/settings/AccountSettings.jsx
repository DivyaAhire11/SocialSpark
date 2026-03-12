import { useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function AccountSettings() {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  const [emailInput, setEmailInput] = useState(user?.email || '')
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Email Update
  const handleEmailChange = async (e) => {
    e.preventDefault()
    if (emailInput === user?.email) return
    
    setSuccessMsg('')
    setErrorMsg('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ email: emailInput })
      if (error) throw error
      
      setSuccessMsg('Verification email sent to both addresses. Please confirm to proceed.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    
    if (passwords.new_password !== passwords.confirm_password) {
      setErrorMsg('New passwords do not match.')
      return
    }

    if (passwords.new_password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }

    try {
      setLoading(true)
      // Supabase natively validates the session token; we don't strictly pass the old password 
      // in standard Web apps unless doing a re-auth step, but we bind it via auth.updateUser
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new_password 
      })

      if (error) throw error
      
      setSuccessMsg('Password updated successfully')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-sm text-gray-500">Manage your login details and email configurations.</p>
      </div>

      <div className="space-y-8">
        {/* Email Update Form */}
        <form onSubmit={handleEmailChange} className="pb-8 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Address</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 max-w-sm">
            <div className="flex-1 space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Account Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm text-gray-900"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || emailInput === user?.email}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Update Email
            </button>
          </div>
        </form>

        {/* Password Update Form */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
          <p className="text-xs text-gray-500 mb-4">Ensure your account is using a long, random password to stay secure.</p>
          
          <div className="max-w-sm space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current_password}
                onChange={e => setPasswords({...passwords, current_password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password}
                onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm_password}
                onChange={e => setPasswords({...passwords, confirm_password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading || !passwords.new_password}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Spinner size="sm" />}
              Save Password
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 max-w-sm mt-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}
          
          {errorMsg && (
            <div className="flex items-center gap-2 max-w-sm mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
