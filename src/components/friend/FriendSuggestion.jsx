import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useFollow } from '../../hooks/useFollow'
import Spinner from '../ui/Spinner'

export default function FriendSuggestion({ user: suggestedUser }) {
  const { isFollowing, toggleFollow, isPending } = useFollow(suggestedUser.id)

  return (
    <div className="flex items-center justify-between py-2">
      <Link to={`/profile/${suggestedUser.id}`} className="flex items-center gap-3 group flex-1 min-w-0">
        <Avatar
          src={suggestedUser.avatar_url}
          alt={suggestedUser.full_name || suggestedUser.username}
          size="sm"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600">
            {suggestedUser.full_name || suggestedUser.username}
          </p>
          <p className="text-xs text-gray-400 truncate">@{suggestedUser.username}</p>
        </div>
      </Link>

      <button
        onClick={() => toggleFollow()}
        disabled={isPending}
        className={`ml-3 flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1
          ${isFollowing
            ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
            : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
      >
        {isPending ? <Spinner size="sm" /> : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}
