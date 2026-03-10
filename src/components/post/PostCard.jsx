import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, MessageCircle, Share2, Bookmark } from 'lucide-react'
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

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      await deletePost.mutateAsync(post.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="card overflow-hidden animate-fade-in hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="md"
            ring
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">
              {profile?.full_name || profile?.username}
            </p>
            <p className="text-xs text-gray-400">
              @{profile?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-36 animate-fade-in">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left font-medium transition-colors"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-700 leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="w-full bg-gray-100 aspect-square sm:aspect-video overflow-hidden">
          <img
            src={post.image_url}
            alt={post.caption || 'Post image'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <LikeButton postId={post.id} initialCount={likeCount} />
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all text-sm font-medium"
            >
              <MessageCircle size={18} />
              <span>{commentCount}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all text-sm font-medium">
              <Share2 size={18} />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-xl transition-all ${saved ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
            <CommentSection postId={post.id} />
          </div>
        )}
      </div>
    </div>
  )
}
