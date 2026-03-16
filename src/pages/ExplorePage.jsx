import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Hash, Heart, MessageCircle, UserPlus, UserCheck,
  Image as ImageIcon, TrendingUp, Clock, X, Sparkles
} from 'lucide-react'
import { useTrendingPosts, useSearch } from '../hooks/useExplore'
import { useFollow } from '../hooks/useFollow'
import { useSuggestions } from '../hooks/useSuggestions'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import PostDetailModal from '../components/post/PostDetailModal'

const TRENDING_TAGS = ['technology', 'design', 'startup', 'coding', 'photography', 'travel', 'art', 'fitness']

// Inline follow button with real toggle logic
function FollowBtn({ targetId }) {
  const { isFollowing, toggleFollow, isPending } = useFollow(targetId)
  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleFollow() }}
      disabled={isPending}
      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
          : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm hover:shadow-md'
      }`}
    >
      {isPending ? (
        <Spinner size="sm" />
      ) : isFollowing ? (
        <><UserCheck size={12} /> Following</>
      ) : (
        <><UserPlus size={12} /> Follow</>
      )}
    </button>
  )
}

// Skeleton card for loading state
function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="aspect-square skeleton rounded-lg md:rounded-xl" />
      ))}
    </div>
  )
}

export default function ExplorePage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular') // 'popular' | 'recent'
  const [selectedPost, setSelectedPost] = useState(null)

  // 300ms debounce as required
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: trendingData, isLoading: trendingLoading } = useTrendingPosts()
  const { data: searchData, isLoading: searchLoading, isFetching: searchFetching } = useSearch(debouncedQuery)
  const { data: suggestions = [] } = useSuggestions()

  const hasSearch = debouncedQuery.trim().length > 0
  const rawTrending = trendingData?.pages.flat() || []

  // Apply sort toggle client-side
  const trendingPosts = sortBy === 'popular'
    ? [...rawTrending].sort((a, b) =>
        ((b.likes?.length || 0) + (b.comments?.length || 0)) -
        ((a.likes?.length || 0) + (a.comments?.length || 0))
      )
    : [...rawTrending].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const searchUsers = searchData?.users || []
  const searchPosts = searchData?.posts || []

  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  return (
    <div className="space-y-5 pb-8">

      {/* Sticky Search Header */}
      <div className="card p-4 sticky top-[72px] z-20 shadow-sm">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" />
          <input
            type="text"
            placeholder="Search people or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-10 py-2.5 text-sm text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent focus:bg-white
                       transition-all duration-200 placeholder:text-gray-400"
          />
          {/* Loading or clear button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {searchFetching ? (
              <Spinner size="sm" />
            ) : query ? (
              <button onClick={clearSearch} className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded-full hover:bg-gray-100">
                <X size={15} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Trending tag chips (only shown when not searching) */}
        {!hasSearch && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Trending</p>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-[#8B5CF6] text-gray-600 hover:text-[#8B5CF6] text-xs font-medium cursor-pointer transition-all duration-200"
                >
                  <Hash size={11} strokeWidth={2.5} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SEARCH RESULTS MODE ── */}
      {hasSearch && (
        <>
          {/* Users section */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <UserPlus size={16} className="text-[#8B5CF6]" />
              People
            </h3>

            {searchLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : searchUsers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm font-medium">No results found</p>
                <p className="text-gray-400 text-xs mt-1">Try a different username or name</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchUsers.map(profile => (
                  <div key={profile.id} className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors group">
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar src={profile.avatar_url} alt={profile.username} size="md" className="flex-shrink-0 group-hover:ring-2 group-hover:ring-[#8B5CF6] transition-all" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#8B5CF6] transition-colors">{profile.full_name || profile.username}</p>
                        <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
                        {profile.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{profile.bio}</p>}
                      </div>
                    </Link>
                    {user?.id !== profile.id && <FollowBtn targetId={profile.id} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posts section */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#8B5CF6]" />
              Posts
            </h3>

            {searchLoading ? (
              <PostGridSkeleton />
            ) : searchPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={22} className="text-[#8B5CF6]" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">No results found</p>
                <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
                  {searchPosts.map(post => (
                    <PostGridCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── EXPLORE MODE (no search) ── */}
      {!hasSearch && (
        <>
          {/* Suggested Users row */}
          {suggestions.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Sparkles size={15} className="text-[#8B5CF6]" />
                  Suggested for you
                </h3>
                <Link to="/friends" className="text-xs text-[#8B5CF6] font-semibold hover:underline">See all</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {suggestions.map(profile => (
                  <div key={profile.id} className="flex-shrink-0 w-36 bg-gray-50 hover:bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#8B5CF6]/30 hover:shadow-md flex flex-col items-center text-center transition-all duration-200">
                    <Link to={`/profile/${profile.id}`} className="mb-2">
                      <Avatar src={profile.avatar_url} alt={profile.username} size="lg" className="hover:ring-2 hover:ring-[#8B5CF6] transition-all" />
                    </Link>
                    <Link to={`/profile/${profile.id}`} className="font-bold text-gray-900 text-xs hover:text-[#8B5CF6] transition-colors truncate w-full mb-0.5">
                      {profile.full_name || profile.username}
                    </Link>
                    <p className="text-xs text-gray-500 truncate w-full mb-3">@{profile.username}</p>
                    {user?.id !== profile.id && <FollowBtn targetId={profile.id} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Posts Grid */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <TrendingUp size={15} className="text-[#8B5CF6]" />
                Trending Posts
              </h3>
              {/* Sort Toggle */}
              <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    sortBy === 'popular' ? 'bg-white text-[#8B5CF6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Heart size={11} /> Popular
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    sortBy === 'recent' ? 'bg-white text-[#8B5CF6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Clock size={11} /> Recent
                </button>
              </div>
            </div>

            {trendingLoading ? (
              <PostGridSkeleton />
            ) : trendingPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={22} className="text-[#8B5CF6]" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">No posts yet</p>
                <p className="text-gray-400 text-xs mt-1">Posts will appear here as people share</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
                {trendingPosts.map(post => (
                  <PostGridCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  )
}

// Reusable post grid card
function PostGridCard({ post, onClick }) {
  const likes = post.likes?.length || 0
  const comments = post.comments?.length || 0

  return (
    <div
      className="relative aspect-square group cursor-pointer overflow-hidden bg-gray-100 rounded-lg md:rounded-xl"
      onClick={onClick}
    >
      {post.image_url ? (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-center">
          <p className="text-xs sm:text-sm font-semibold text-gray-700 line-clamp-4 leading-snug">{post.caption}</p>
          {post.profiles && (
            <p className="text-xs text-gray-400 mt-2">@{post.profiles.username}</p>
          )}
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-5 text-white">
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Heart fill="white" size={18} />
          <span>{likes}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <MessageCircle fill="white" size={18} />
          <span>{comments}</span>
        </div>
      </div>
    </div>
  )
}

