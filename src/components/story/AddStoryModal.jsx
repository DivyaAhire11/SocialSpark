import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import { useCreateStory } from '../../hooks/useStories'
import Spinner from '../ui/Spinner'

export default function AddStoryModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  
  const createStory = useCreateStory()

  if (!isOpen) return null

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    setError('')
    
    if (selected) {
      // Validate file type
      if (!selected.type.startsWith('image/') && !selected.type.startsWith('video/')) {
        setError('Please select a valid image or video file.')
        return
      }
      
      // Limit video size (e.g., 20MB)
      if (selected.type.startsWith('video/') && selected.size > 20 * 1024 * 1024) {
        setError('Video must be less than 20MB.')
        return
      }

      setFile(selected)
      
      // Create local preview
      const objectUrl = URL.createObjectURL(selected)
      setPreview(objectUrl)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setError('')
    
    try {
      await createStory.mutateAsync(file)
      
      // Cleanup
      if (preview) URL.revokeObjectURL(preview)
      setFile(null)
      setPreview(null)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to upload story')
    }
  }

  const isVideo = file?.type.startsWith('video/')

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add to Story</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-[60vh] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors group"
            >
              <div className="flex gap-4 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                <ImageIcon size={40} strokeWidth={1.5} />
                <Video size={40} strokeWidth={1.5} />
              </div>
              <p className="font-medium text-gray-700">Select Image or Video</p>
              <p className="text-sm text-gray-400 mt-1 text-center px-4">
                Videos must be under 20MB. Stories disappear after 24 hours.
              </p>
            </div>
          ) : (
            <div className="relative w-full aspect-[9/16] max-h-[60vh] bg-black rounded-xl overflow-hidden shadow-inner">
              {isVideo ? (
                <video 
                  src={preview} 
                  autoPlay 
                  controls 
                  className="w-full h-full object-contain"
                />
              ) : (
                <img 
                  src={preview} 
                  alt="Story preview" 
                  className="w-full h-full object-contain"
                />
              )}
              <button
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                  URL.revokeObjectURL(preview)
                }}
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
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            disabled={createStory.isPending}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || createStory.isPending}
            className="btn-primary"
          >
            {createStory.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Uploading...
              </span>
            ) : (
              'Share to Story'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
