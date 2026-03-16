import { useState, useRef } from 'react'
import { X, ImagePlus, CheckCircle2 } from 'lucide-react'
import { useCreateStory } from '../../hooks/useStories'
import Spinner from '../ui/Spinner'

export default function AddStoryModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const createStory = useCreateStory()

  if (!isOpen) return null

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setError('')

    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP, etc.)')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return
    setError('')
    try {
      await createStory.mutateAsync(file)
      setSuccess(true)
      setTimeout(() => {
        handleRemove()
        setSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to upload story. Check Supabase storage bucket.')
    }
  }

  const handleClose = () => {
    if (!createStory.isPending) {
      handleRemove()
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add to Story</h2>
          <button
            onClick={handleClose}
            disabled={createStory.isPending}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-800">Story shared!</p>
              <p className="text-sm text-gray-500">Your story will be live for 24 hours.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {!preview ? (
                /* Upload area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[9/16] max-h-[55vh] border-2 border-dashed border-[#8B5CF6]/30 hover:border-[#8B5CF6] rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-purple-50/30 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                    <ImagePlus size={28} className="text-[#8B5CF6]" />
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">Select an image</p>
                  <p className="text-xs text-gray-400 mt-1 text-center px-6">
                    JPG, PNG, WEBP · Max 10MB
                  </p>
                  <p className="text-xs text-[#8B5CF6] mt-3 font-medium">
                    Stories expire after 24 hours
                  </p>
                </div>
              ) : (
                /* Preview */
                <div className="relative w-full aspect-[9/16] max-h-[55vh] bg-black rounded-2xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Story preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={handleClose}
              disabled={createStory.isPending}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || createStory.isPending}
              className="flex-1 btn-primary py-2.5"
            >
              {createStory.isPending ? (
                <><Spinner size="sm" /><span>Sharing...</span></>
              ) : (
                'Share Story'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

