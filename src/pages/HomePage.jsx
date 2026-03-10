import { useRef, useCallback } from 'react'
import { usePosts } from '../hooks/usePosts'
import PostCard from '../components/post/PostCard'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import PostCreateModal from '../components/post/PostCreateModal'
import { useState } from 'react'
import { PlusCircle, Rss } from 'lucide-react'

// Skeleton loader
function PostSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="p-4 flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-2 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
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
    <div className="space-y-4">
      {/* Create post prompt */}
      <div className="card p-3.5">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 text-left"
        >
          <div className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 transition-colors cursor-text">
            What's on your mind?
          </div>
          <div className="btn-primary py-2 px-3.5 text-sm flex-shrink-0">
            <PlusCircle size={15} />
            <span className="hidden sm:inline">Post</span>
          </div>
        </button>
      </div>

      {/* Feed label */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <Rss size={15} className="text-gray-500" />
        <h2 className="font-semibold text-gray-800 text-sm">Your Feed</h2>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
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
          <h3 className="font-semibold text-gray-700 text-base">Your feed is empty</h3>
          <p className="text-gray-400 text-sm mt-1.5 mb-5 max-w-xs mx-auto">
            Follow people or create your first post to see content here.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            <PlusCircle size={15} />
            Create first post
          </button>
        </div>
      )}

      <div className="space-y-4">
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
