import { useState } from 'react'
import { X } from 'lucide-react'
import Spinner from '../ui/Spinner'
import { useUpdatePost } from '../../hooks/usePosts'

export default function EditPostModal({ post, isOpen, onClose }) {
  const [caption, setCaption] = useState(post.caption || '')
  const updatePost = useUpdatePost()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (updatePost.isPending) return

    try {
      await updatePost.mutateAsync({ postId: post.id, caption: caption.trim() })
      onClose()
    } catch (err) {
      console.error("Failed to update post:", err)
      alert("Failed to update post.")
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Edit Post</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 px-1">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something..."
                className="w-full h-32 bg-gray-50 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#8B5CF6] transition-all resize-none"
                autoFocus
              />
            </div>

            {post.image_url && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 aspect-video">
                <img 
                  src={post.image_url} 
                  alt="Post preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>
            )}
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
              disabled={updatePost.isPending}
              className="btn-primary px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 min-w-[100px] justify-center"
            >
              {updatePost.isPending ? <Spinner size="sm" color="white" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
