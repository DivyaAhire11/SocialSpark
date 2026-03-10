import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useFollow } from '../../hooks/useFollow'
import Spinner from '../ui/Spinner'

export default function FriendSuggestion({ user: suggestedUser }) {
  const { isFollowing, toggleFollow, isPending } = useFollow(suggestedUser.id)

  return (
    <div className="flex items-center justify-between py-2">
      <Link to={`/profile/${suggestedUser.id}`} className="flex items-center gap-2.5 group flex-1 min-w-0">
        <Avatar
          src={suggestedUser.avatar_url}
          alt={suggestedUser.full_name || suggestedUser.username}
          size="sm"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {suggestedUser.full_name || suggestedUser.username}
          </p>
          <p className="text-xs text-gray-500 truncate">@{suggestedUser.username}</p>
        </div>
      </Link>

      <button
        onClick={() => toggleFollow()}
        disabled={isPending}
        className={`ml-3 flex-shrink-0 flex items-center gap-1 disabled:opacity-60 ${isFollowing ? 'btn-following' : 'btn-follow'
          }`}
      >
        {isPending ? <Spinner size="sm" /> : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}
