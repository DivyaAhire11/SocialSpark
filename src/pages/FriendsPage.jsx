import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, UserPlus, UserMinus, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFollowingList, useFollowersList, useFollow } from '../hooks/useFollow'
import { useSuggestions } from '../hooks/useSuggestions'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

// Standardized User Item Component
function UserCard({ profile, actionType }) {
  const { isFollowing, toggleFollow, isPending, isLoading } = useFollow(profile.id)

  const handleAction = () => {
    if (isLoading) return 
    toggleFollow()
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <Link to={`/profile/${profile.id}`} className="flex items-center gap-3">
        <Avatar src={profile.avatar_url} alt={profile.username} size="lg" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{profile.full_name || profile.username}</p>
          <p className="text-xs text-gray-500">@{profile.username}</p>
          {profile.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{profile.bio}</p>}
        </div>
      </Link>

      <button 
        onClick={handleAction}
        disabled={isPending}
        className={`px-4 py-1.5 min-w-[100px] text-xs font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 ${
          isFollowing ? 'btn-following' : 'btn-follow'
        }`}
      >
        {isPending ? <Spinner size="sm" /> : (
          isFollowing ? (
            <>
              <UserCheck size={14} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={14} />
              <span>Follow</span>
            </>
          )
        )}
      </button>
    </div>
  )
}

export default function FriendsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('following')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all lists
  const { data: followingList = [], isLoading: isLoadingFollowing } = useFollowingList(user?.id)
  const { data: followersList = [], isLoading: isLoadingFollowers } = useFollowersList(user?.id)
  const { data: suggestionList = [], isLoading: isLoadingSuggestions } = useSuggestions()

  // Select active array
  const activeList = useMemo(() => {
    if (activeTab === 'following') return followingList
    if (activeTab === 'followers') return followersList
    return suggestionList
  }, [activeTab, followingList, followersList, suggestionList])

  const isLoading = activeTab === 'following' ? isLoadingFollowing : 
                    activeTab === 'followers' ? isLoadingFollowers : 
                    isLoadingSuggestions

  // Filter based on search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList
    
    const lowerQ = searchQuery.toLowerCase()
    return activeList.filter(p => 
      (p.username && p.username.toLowerCase().includes(lowerQ)) || 
      (p.full_name && p.full_name.toLowerCase().includes(lowerQ))
    )
  }, [activeList, searchQuery])

  return (
    <div className="space-y-4 pb-8 h-[calc(100vh-theme(spacing.16))] flex flex-col pt-4">
      
      {/* Search Header */}
      <div className="card p-4 shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all caret-[#8B5CF6]"
          />
        </div>
      </div>

      <div className="card flex flex-col flex-1 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[
            { id: 'following', label: 'Following', count: followingList.length },
            { id: 'followers', label: 'Followers', count: followersList.length },
            { id: 'suggestions', label: 'Suggestions', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-[#8B5CF6] text-[#8B5CF6]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto w-full max-w-full">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users size={40} className="mx-auto text-gray-200 mb-3" />
              <h3 className="text-gray-700 font-semibold mb-1">No users found</h3>
              <p className="text-gray-400 text-sm">
                {searchQuery 
                  ? "We couldn't find anyone matching your search." 
                  : activeTab === 'following' 
                    ? "You aren't following anyone yet."
                    : activeTab === 'followers'
                      ? "You don't have any followers yet."
                      : "No suggestions available right now."
                }
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredList.map(profile => (
                <UserCard 
                  key={profile.id} 
                  profile={profile} 
                  actionType={activeTab} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
