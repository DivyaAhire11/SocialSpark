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
    <Modal isOpen={isOpen} onClose={handleClose} title="Create post">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="md"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900">{profile?.full_name || profile?.username}</p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
              Public
            </span>
          </div>
        </div>

        {/* Caption */}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300
                     placeholder:text-gray-400 text-gray-900 leading-relaxed"
        />

        {/* Image preview */}
        {preview && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full max-h-56 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-gray-900/70 text-white p-1.5 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div>
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
              className="btn-ghost py-1.5 px-2 text-sm text-gray-500 cursor-pointer"
            >
              <ImagePlus size={16} />
              <span>Photo</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="btn-secondary py-1.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPost.isPending || (!caption.trim() && !imageFile)}
              className="btn-primary py-1.5"
            >
              {createPost.isPending ? (
                <><Spinner size="sm" /> Posting...</>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
