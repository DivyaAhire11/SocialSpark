import { useRef, useCallback, useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import PostCard from '../components/post/PostCard'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import PostCreateModal from '../components/post/PostCreateModal'
import { PlusCircle, Rss, Image, Video, MapPin } from 'lucide-react'
import Avatar from '../components/ui/Avatar'

// Skeleton loader
function PostSkeleton() {
  return (
    <div className="post-card animate-pulse">
      <div className="p-4 flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-2 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton w-full h-48" style={{ borderRadius: 0 }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePosts()

  // Infinite scroll observer
  const observerRef = useRef()
  const loadMoreRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flat() ?? []

  return (
    <div className="space-y-5">
      {/* Create post box */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="md"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400 text-left transition-colors cursor-text"
          >
            What's on your mind?
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => setShowCreate(true)} className="btn-ghost py-1.5 text-gray-500 flex-1 justify-center text-sm">
            <Image size={16} strokeWidth={1.8} className="text-blue-500" />
            Photo
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-ghost py-1.5 text-gray-500 flex-1 justify-center text-sm">
            <Video size={16} strokeWidth={1.8} className="text-red-500" />
            Video
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-ghost py-1.5 text-gray-500 flex-1 justify-center text-sm">
            <MapPin size={16} strokeWidth={1.8} className="text-green-500" />
            Location
          </button>
        </div>
      </div>

      {/* Feed label */}
      <div className="flex items-center gap-2 px-0.5">
        <Rss size={15} className="text-blue-500" />
        <h2 className="font-bold text-gray-900 text-sm">Recent Posts</h2>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-5">
          {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load posts.</p>
          <p className="text-gray-400 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && !error && (
        <div className="card p-12 text-center">
          <Rss size={28} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 text-base">No posts yet</h3>
          <p className="text-gray-500 text-sm mt-1.5 mb-5 max-w-xs mx-auto">
            No posts yet. Follow people or create your first post.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            <PlusCircle size={15} />
            Create Post
          </button>
        </div>
      )}

      <div className="space-y-5">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Spinner />}
      </div>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
