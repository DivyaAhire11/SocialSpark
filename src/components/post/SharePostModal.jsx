import { useState } from 'react'
import { X } from 'lucide-react'
import Spinner from '../ui/Spinner'
import Avatar from '../ui/Avatar'
import { useSharePost } from '../../hooks/usePosts'
import { formatDistanceToNow } from 'date-fns'

export default function SharePostModal({ post, isOpen, onClose }) {
  const [caption, setCaption] = useState('')
  const sharePost = useSharePost()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sharePost.isPending) return

    try {
      await sharePost.mutateAsync({ originalPostId: post.id, caption: caption.trim() })
      onClose()
    } catch (err) {
      console.error("Failed to share post:", err)
      alert("Failed to share post.")
    }
  }

  const originalAuthor = post.profiles

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Share Post</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* New Caption Input */}
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-24 bg-gray-50 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#8B5CF6] transition-all resize-none"
                autoFocus
              />
            </div>

            {/* Original Post Preview */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <Avatar 
                  src={originalAuthor?.avatar_url} 
                  alt={originalAuthor?.username} 
                  size="sm" 
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {originalAuthor?.full_name || originalAuthor?.username}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    @{originalAuthor?.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {post.caption && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{post.caption}</p>
              )}
              
              {post.image_url && (
                <div className="rounded-lg overflow-hidden border border-gray-100 aspect-video">
                  <img src={post.image_url} alt="Shared content" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sharePost.isPending}
              className="btn-primary px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 min-w-[100px] justify-center"
            >
              {sharePost.isPending ? <Spinner size="sm" color="white" /> : 'Share Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
