import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import { useCreatePost } from '../../hooks/usePosts'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

export default function PostCreateModal({ isOpen, onClose }) {
  const { profile } = useAuth()
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef()
  const createPost = useCreatePost()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const removeImage = () => {
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!caption.trim() && !imageFile) {
      setError('Please add a caption or image')
      return
    }
    setError(null)
    try {
      await createPost.mutateAsync({ caption, imageFile })
      setCaption('')
      removeImage()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create post')
    }
  }

  const handleClose = () => {
    if (!createPost.isPending) {
      setCaption('')
      removeImage()
      setError(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="md"
            ring
          />
          <div>
            <p className="font-semibold text-sm text-gray-900">{profile?.full_name || profile?.username}</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Public</span>
          </div>
        </div>

        {/* Caption */}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent
                     placeholder:text-gray-400 transition-all"
        />

        {/* Image preview */}
        {preview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
              id="post-image-upload"
            />
            <label
              htmlFor="post-image-upload"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 cursor-pointer px-3 py-2 rounded-xl hover:bg-primary-50 transition-all font-medium"
            >
              <ImagePlus size={18} />
              <span>Photo</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="btn-secondary text-sm py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPost.isPending || (!caption.trim() && !imageFile)}
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              {createPost.isPending ? (
                <>
                  <Spinner size="sm" />
                  Posting...
                </>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
