import { useState, useRef } from 'react'
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUpdateProfile } from '../../hooks/useProfile'
import { supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'

export default function ProfileSettings() {
  const { profile, user } = useAuth()
  const updateProfile = useUpdateProfile()
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'bio' && value.length > 160) return
    setFormData({ ...formData, [name]: value })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Must be an image file')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const checkUsernameUnique = async (username) => {
    if (username === profile?.username) return true
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .neq('id', user.id)
      .single()
    return !data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    
    try {
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long.')
      }

      const isUnique = await checkUsernameUnique(formData.username)
      if (!isUnique) {
        throw new Error('Username is already taken.')
      }

      await updateProfile.mutateAsync({
        ...formData,
        avatarFile
      })
      setSuccessMsg('Profile updated successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-500">Update your photo and personal details here.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative group">
            <Avatar 
              src={avatarPreview} 
              alt="Profile preview" 
              size="lg" 
              className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-sm"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={24} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Profile picture</h3>
            <p className="text-xs text-gray-500 mb-2">JPG, GIF or PNG. 1MB max.</p>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upload new picture
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm"
              placeholder="Alice Wonderland"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm"
              placeholder="alice123"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <span className="text-xs text-gray-500">{formData.bio.length} / 160</span>
          </div>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#4F46E5] text-sm resize-none"
            placeholder="Write a short summary about yourself..."
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending && <Spinner size="sm" />}
            Save Changes
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium animate-fade-in">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium animate-fade-in">
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

      </form>
    </div>
  )
}
