import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useLikes } from '../../hooks/useLikes'
import { useAuth } from '../../hooks/useAuth'

export default function LikeButton({ postId, initialCount = 0, postAuthorId }) {
  const { user } = useAuth()
  const { isLiked, likeCount, toggleLike } = useLikes(postId)
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (!user) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)
    toggleLike(postAuthorId)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!user}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
        isLiked
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      <Heart
        size={18}
        strokeWidth={isLiked ? 2 : 1.8}
        fill={isLiked ? 'currentColor' : 'none'}
        className={`${animating ? 'animate-heart-pop' : ''} transition-transform`}
      />
      <span>{likeCount > 0 ? likeCount : 'Like'}</span>
    </button>
  )
}
