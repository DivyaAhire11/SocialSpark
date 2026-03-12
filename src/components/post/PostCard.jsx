import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, MessageCircle, Share2, Bookmark, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import { useAuth } from '../../hooks/useAuth'
import { useDeletePost } from '../../hooks/usePosts'

export default function PostCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [saved, setSaved] = useState(false)
  const deletePost = useDeletePost()

  const profile = post.profiles
  const isOwner = user?.id === post.user_id
  const likeCount = post.likes?.length ?? 0
  const commentCount = post.comments?.length ?? 0
  
  // Get first 2 comments for preview
  const previewComments = post.comments?.slice(0, 2) || []

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      await deletePost.mutateAsync(post.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="post-card p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="md"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
              {profile?.full_name || profile?.username}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              @{profile?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal size={17} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl border border-gray-200 py-1 z-10 w-36 animate-fade-in"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left transition-colors"
                >
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="pb-3">
          <p className="text-sm text-gray-800 leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="w-full mb-3">
          <img
            src={post.image_url}
            alt={post.caption || 'Post image'}
            className="w-full object-cover max-h-96 rounded-lg border border-gray-100"
            loading="lazy"
          />
        </div>
      )}

      {/* Action bar area */}
      <div>
        {/* Like/comment counts summary */}
        {(likeCount > 0 || commentCount > 0) && (
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2 pb-2 border-b border-gray-100">
            <span>{likeCount > 0 ? `${likeCount} like${likeCount !== 1 ? 's' : ''}` : ''}</span>
            <span>{commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : ''}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-0.5">
            <LikeButton postId={post.id} initialCount={likeCount} postAuthorId={post.user_id} />
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              <MessageCircle size={17} strokeWidth={1.8} />
              <span>Comment</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm font-medium">
              <Share2 size={17} strokeWidth={1.8} />
              <span>Share</span>
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${saved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
          >
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Inline Comments Preview (Always visible unless full section is open) */}
        {!showComments && previewComments.length > 0 && (
          <div className="mt-1 space-y-1">
            {previewComments.map(comment => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold text-gray-900 mr-2">
                  {comment.profiles?.username || 'User'}
                </span>
                <span className="text-gray-700">{comment.content}</span>
              </div>
            ))}
            {commentCount > 2 && (
              <button 
                onClick={() => setShowComments(true)}
                className="text-sm text-gray-500 hover:text-gray-700 mt-1 font-medium"
              >
                View all {commentCount} comments
              </button>
            )}
          </div>
        )}

        {/* Full Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
            <CommentSection postId={post.id} postAuthorId={post.user_id} />
          </div>
        )}
      </div>
    </div>
  )
}
