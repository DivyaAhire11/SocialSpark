import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Hash, Heart, MessageCircle, UserPlus, Image as ImageIcon } from 'lucide-react'
import { useTrendingPosts, useSearch } from '../hooks/useExplore'
import { useSuggestions } from '../hooks/useSuggestions'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import PostDetailModal from '../components/post/PostDetailModal'

const TRENDING_TAGS = ['technology', 'design', 'startup', 'coding', 'photography', 'travel']

export default function ExplorePage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: trendingData, isLoading: trendingLoading } = useTrendingPosts()
  const { data: searchData, isLoading: searchLoading, isFetching: searchFetching } = useSearch(debouncedQuery)
  const { data: suggestions, isLoading: suggestionsLoading } = useSuggestions()

  const trendingPosts = trendingData?.pages.flat() || []
  const hasSearch = debouncedQuery.length > 0
  
  // Decide what posts/users to display based on search state
  const displayPosts = hasSearch ? (searchData?.posts || []) : trendingPosts
  const displayUsers = hasSearch ? (searchData?.users || []) : (suggestions || [])

  return (
    <div className="space-y-6 pb-8">
      
      {/* Search Header */}
      <div className="card p-4 sticky top-[72px] z-20">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for users or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all caret-blue-500"
          />
          {searchFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Trending Tags (Only show when not searching) */}
        {!hasSearch && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 px-1">
              Trending Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Hash size={12} strokeWidth={2.5} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Users / Account Search Results */}
      {(hasSearch || (!hasSearch && displayUsers.length > 0)) && (
        <div className="card p-5">
          <h3 className="section-heading flex items-center gap-2 mb-4">
            {hasSearch ? 'Accounts' : 'Suggested Users'}
          </h3>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {suggestionsLoading || searchLoading ? (
              <div className="flex justify-center w-full py-4"><Spinner /></div>
            ) : displayUsers.length === 0 ? (
              <p className="text-sm text-gray-400">No users found.</p>
            ) : (
              displayUsers.map(profile => (
                <div key={profile.id} className="flex-shrink-0 w-36 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <Link to={`/profile/${profile.id}`}>
                    <Avatar src={profile.avatar_url} alt={profile.username} size="lg" className="mb-2" />
                  </Link>
                  <Link to={`/profile/${profile.id}`} className="font-semibold text-gray-900 text-sm hover:underline truncate w-full">
                    {profile.full_name || profile.username}
                  </Link>
                  <p className="text-xs text-gray-500 truncate w-full mb-3">@{profile.username}</p>
                  
                  {user?.id !== profile.id && (
                    <button className="btn-follow w-full py-1.5 text-xs">
                      Follow
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="card p-5">
        <h3 className="section-heading mb-4">
          {hasSearch ? 'Post Results' : 'Trending Posts'}
        </h3>
        
        {trendingLoading || searchLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
            {displayPosts.map((post) => {
              const likes = post.likes?.length || 0;
              const comments = post.comments?.length || 0;

              return (
                <div 
                  key={post.id} 
                  className="relative aspect-square group cursor-pointer overflow-hidden bg-gray-100 rounded-lg md:rounded-xl"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt="Post content" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                  ) : (
                     <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gradient-to-br from-gray-50 to-gray-200 text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-4">{post.caption}</p>
                     </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 sm:gap-6 text-white font-bold text-sm sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                       <Heart fill="white" size={18} className="sm:w-5 sm:h-5" />
                       <span>{likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                       <MessageCircle fill="white" size={18} className="sm:w-5 sm:h-5 "/>
                       <span>{comments}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PostDetailModal 
        post={selectedPost} 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
      />
    </div>
  )
}
