import { useState } from 'react'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import { useAllSavedPosts } from '../hooks/useSavedPosts'
import Spinner from '../components/ui/Spinner'
import PostDetailModal from '../components/post/PostDetailModal'

export default function SavedPage() {
  const { data: savedPosts = [], isLoading } = useAllSavedPosts()
  const [selectedPost, setSelectedPost] = useState(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm">
          <Bookmark size={24} className="text-gray-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
          <p className="text-sm text-gray-500">Only you can see what you've saved</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : savedPosts.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div className="w-20 h-20 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400">
            <Bookmark size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Save Posts</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-6 px-1">
          {savedPosts.map((saved) => {
            const post = saved.posts
            if (!post) return null // defensive check if post was deleted
            
            const likeCount = post.likes ? post.likes.length : 0
            const commentCount = post.comments ? post.comments.length : 0

            return (
              <button 
                key={saved.id}
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square bg-gray-100 overflow-hidden sm:rounded-xl cursor-pointer"
              >
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt="Saved content" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <p className="text-xs sm:text-sm text-gray-700 text-center font-medium line-clamp-4">
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 sm:gap-6 backdrop-blur-[2px]">
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm sm:text-base">
                    <Heart size={18} fill="currentColor" />
                    <span>{likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm sm:text-base">
                    <MessageCircle size={18} fill="currentColor" />
                    <span>{commentCount}</span>
                  </div>
                </div>

                {/* Author attribution */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <span className="text-white text-xs font-medium truncate drop-shadow-md">
                    @{post.profiles?.username}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Post Modal Trigger */}
      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          isOpen={!!selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

    </div>
  )
}
