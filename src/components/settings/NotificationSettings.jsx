import { useState, useEffect } from 'react'
import { CheckCircle2, BellRing } from 'lucide-react'
import { useUserSettings } from '../../hooks/useUserSettings'
import Spinner from '../ui/Spinner'

// Reusable toggle switch component matching privacy
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

export default function NotificationSettings() {
  const { settings, isLoading, updateSettings } = useUserSettings()
  
  const [localSettings, setLocalSettings] = useState({
    notify_likes: true,
    notify_comments: true,
    notify_followers: true
  })
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleToggle = (key) => async (val) => {
    // Optimistic UI update
    setLocalSettings(prev => ({ ...prev, [key]: val }))
    setSuccessMsg('')
    
    try {
      await updateSettings.mutateAsync({ [key]: val })
      setSuccessMsg('Settings saved successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      // Revert if API fails
      setLocalSettings(prev => ({ ...prev, [key]: !val }))
      alert('Failed to save notification preferences')
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-sm text-gray-500">Choose what events trigger in-app notifications.</p>
      </div>

      <div className="space-y-6">
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <BellRing size={16} className="text-gray-400" />
            Activity Alerts
          </h3>
          <div className="bg-white border border-gray-100 rounded-xl px-4 divide-y divide-gray-50">
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner size="md" /></div>
            ) : (
              <>
                <Toggle 
                  enabled={localSettings.notify_likes} 
                  onChange={handleToggle('notify_likes')}
                  disabled={updateSettings.isPending}
                  label="Likes on my posts" 
                  description="Receive an alert when someone hearts your content."
                />
                <Toggle 
                  enabled={localSettings.notify_comments} 
                  onChange={handleToggle('notify_comments')}
                  disabled={updateSettings.isPending}
                  label="Comments on my posts" 
                />
                <Toggle 
                  enabled={localSettings.notify_followers} 
                  onChange={handleToggle('notify_followers')}
                  disabled={updateSettings.isPending}
                  label="New followers" 
                  description="Receive an alert when someone starts following your profile."
                />
              </>
            )}
          </div>
        </div>

        {successMsg && !updateSettings.isPending && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium animate-fade-in max-w-sm">
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

      </div>
    </div>
  )
}
