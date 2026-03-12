import { useState, useEffect } from 'react'
import { Lock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUpdateProfile } from '../../hooks/useProfile'
import Spinner from '../ui/Spinner'

// Reusable toggle switch component
function Toggle({ enabled, onChange, label, description, disabled }) {
  return (
    <div className={`flex items-start justify-between py-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 pr-6">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
          enabled ? 'bg-[#4F46E5]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function PrivacySettings() {
  const { profile } = useAuth()
  const updateProfile = useUpdateProfile()

  const [isPrivate, setIsPrivate] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setIsPrivate(!!profile.is_private)
    }
  }, [profile])

  const handleToggle = async (val) => {
    setIsPrivate(val)
    setSuccessMsg('')
    try {
      await updateProfile.mutateAsync({ is_private: val })
      setSuccessMsg('Privacy settings saved successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      // Revert local state on failure
      setIsPrivate(!val)
      alert("Failed to update privacy settings.")
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
        <p className="text-sm text-gray-500">Manage who can see your content and profile.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Lock size={16} className="text-gray-400" />
            Account Visibility
          </h3>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <Toggle 
              enabled={isPrivate} 
              onChange={handleToggle}
              disabled={updateProfile.isPending}
              label="Private Account"
              description="When your account is private, only your followers can see your posts. Your existing followers won't be affected."
            />
          </div>
        </div>

        {updateProfile.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Saving changes...
          </div>
        )}

        {successMsg && !updateProfile.isPending && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium animate-fade-in max-w-sm">
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

      </div>
    </div>
  )
}
