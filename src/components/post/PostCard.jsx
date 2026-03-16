import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, MessageCircle, Share2, Bookmark, Edit2, Trash2, Repeat } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import EditPostModal from './EditPostModal'
import SharePostModal from './SharePostModal'
import { useAuth } from '../../hooks/useAuth'
import { useDeletePost } from '../../hooks/usePosts'
import { useSavedStatus } from '../../hooks/useSavedPosts'

export default function PostCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  
  const deletePost = useDeletePost()
  const { isSaved, toggleSaved, isPending: isSavePending } = useSavedStatus(post.id)

  const profile = post.profiles
  const isOwner = user?.id === post.user_id
  const commentCount = post.comments?.length ?? 0
  
  // Get first 2 comments for preview
  const previewComments = post.comments?.slice(0, 2) || []

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      await deletePost.mutateAsync(post.id)
    }
    setShowMenu(false)
  }

  const SharedPostView = ({ sharedPost }) => {
    if (!sharedPost) return null
    const originalAuthor = sharedPost.profiles
    
    return (
      <div className="mt-2 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30 hover:bg-gray-50/50 transition-colors duration-200">
        <Link to={`/profile/${sharedPost.user_id}`} className="p-4 block">
          <div className="flex items-center gap-2 mb-3">
            <Avatar 
              src={originalAuthor?.avatar_url} 
              alt={originalAuthor?.username} 
              size="sm" 
            />
            <div>
              <p className="text-xs font-bold text-gray-900 leading-none">
                {originalAuthor?.full_name || originalAuthor?.username}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                @{originalAuthor?.username} • {formatDistanceToNow(new Date(sharedPost.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {sharedPost.caption && (
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{sharedPost.caption}</p>
          )}
          
          {sharedPost.image_url && (
            <div className="rounded-xl overflow-hidden border border-gray-100/50">
              <img 
                src={sharedPost.image_url} 
                alt="Shared content" 
                className="w-full object-cover max-h-80" 
              />
            </div>
          )}
        </Link>
      </div>
    )
  }

  return (
    <div className="post-card animate-fade-in group/card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.full_name || profile?.username}
              size="md"
              className="ring-2 ring-transparent group-hover:ring-[#8B5CF6] transition-colors duration-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 text-sm group-hover:text-[#8B5CF6] transition-colors">
                  {profile?.full_name || profile?.username}
                </p>
                {post.shared_post_id && (
                  <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-[#8B5CF6] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    <Repeat size={10} strokeWidth={3} />
                    Shared
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                @{profile?.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <div 
              className="absolute right-0 top-10 bg-white rounded-xl border border-gray-200 py-1.5 z-10 w-44 shadow-dropdown animate-fade-in overflow-hidden"
              onMouseLeave={() => setShowMenu(false)}
            >
              {isOwner && (
                <>
                  <button
                    onClick={() => { setIsEditOpen(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <Edit2 size={16} className="text-gray-400" />
                    Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete post
                  </button>
                </>
              )}
              <button
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2.5 transition-colors"
              >
                <Bookmark size={16} className="text-gray-400" />
                {isSaved ? 'Remove from saved' : 'Save post'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="pb-3">
          <p className="text-sm text-gray-800 leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Shared Post content */}
      {post.shared_post && <SharedPostView sharedPost={post.shared_post} />}

      {/* Primary Image (if not shared) */}
      {!post.shared_post_id && post.image_url && (
        <div className="w-full mb-4">
          <img
            src={post.image_url}
            alt={post.caption || 'Post image'}
            className="w-full object-cover max-h-[500px] rounded-xl border border-gray-100"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Buttons Footer */}
      <div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
          <div className="flex items-center gap-1 -ml-2">
            <LikeButton postId={post.id} initialCount={post.likes?.length ?? 0} postAuthorId={post.user_id} />
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#8B5CF6] transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
            >
              <MessageCircle size={18} strokeWidth={1.8} />
              <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
            </button>
            
            <button 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#8B5CF6] transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
            >
              <Share2 size={18} strokeWidth={1.8} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <button
            onClick={() => toggleSaved()}
            disabled={isSavePending}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 -mr-2 ${
              isSaved ? 'text-[#8B5CF6] bg-purple-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Bookmark size={18} strokeWidth={1.8} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Inline Comments Preview */}
        {!showComments && previewComments.length > 0 && (
          <div className="mt-3 space-y-1.5 px-1">
            {previewComments.map(comment => (
              <div key={comment.id} className="text-sm">
                <span className="font-bold text-gray-900 mr-2">
                  {comment.profiles?.username || 'User'}
                </span>
                <span className="text-gray-700">{comment.content}</span>
              </div>
            ))}
            {commentCount > 2 && (
              <button 
                onClick={() => setShowComments(true)}
                className="text-sm text-gray-500 hover:text-gray-900 mt-1.5 font-medium transition-colors"
              >
                View all {commentCount} comments
              </button>
            )}
          </div>
        )}

        {/* Full Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <CommentSection postId={post.id} postAuthorId={post.user_id} />
          </div>
        )}
      </div>

      {/* Modals */}
      {isEditOpen && (
        <EditPostModal 
          post={post} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
      {isShareOpen && (
        <SharePostModal 
          post={post} 
          isOpen={isShareOpen} 
          onClose={() => setIsShareOpen(false)} 
        />
      )}
    </div>
  )
}
