import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useLikes } from '../../hooks/useLikes'
import { useAuth } from '../../hooks/useAuth'

export default function LikeButton({ postId, initialCount = 0 }) {
  const { user } = useAuth()
  const { isLiked, likeCount, toggleLike } = useLikes(postId)
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (!user) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    toggleLike()
  }

  return (
    <button
      onClick={handleClick}
      disabled={!user}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium
        ${isLiked
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'
        }`}
    >
      <Heart
        size={18}
        fill={isLiked ? 'currentColor' : 'none'}
        className={animating ? 'animate-heart-pop' : ''}
      />
      <span>{likeCount || initialCount}</span>
    </button>
  )
}
