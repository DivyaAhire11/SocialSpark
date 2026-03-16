import { useEffect } from 'react'
import { X } from 'lucide-react'
import PostCard from './PostCard'

export default function PostDetailModal({ post, isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen || !post) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow-lg transition-colors"
        >
          <X size={18} />
        </button>
        <PostCard post={post} />
      </div>
    </div>
  )
}

