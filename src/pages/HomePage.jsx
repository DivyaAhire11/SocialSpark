import { useRef, useCallback, useState, useEffect } from 'react'
import { usePosts } from '../hooks/usePosts'
import { useStories } from '../hooks/useStories'
import { useCreatePost } from '../hooks/usePosts'
import PostCard from '../components/post/PostCard'
import StoriesRow from '../components/story/StoriesRow'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { ImagePlus, X, Send, Rss, CheckCircle2 } from 'lucide-react'
import Avatar from '../components/ui/Avatar'

// Post Skeleton loader
function PostSkeleton() {
  return (
    <div className="post-card animate-pulse">
      <div className="flex items-center gap-3 pb-4">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-2 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton w-full h-52 rounded-xl mb-4" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  )
}

// Toast notification component
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
        {message}
      </div>
    </div>
  )
}

// Inline Create Post Composer
function CreatePostBox({ onPostSuccess }) {
  const { profile } = useAuth()
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [focused, setFocused] = useState(false)
  const fileRef = useRef()
  const createPost = useCreatePost()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const removeImage = () => {
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!caption.trim() && !imageFile) { setError('Add a caption or photo'); return }
    setError(null)
    try {
      await createPost.mutateAsync({ caption: caption.trim(), imageFile })
      setCaption('')
      removeImage()
      setFocused(false)
      onPostSuccess?.()
    } catch (err) {
      setError(err.message || 'Failed to create post')
    }
  }

  const canPost = (caption.trim().length > 0 || !!imageFile) && !createPost.isPending

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Avatar src={profile?.avatar_url} alt={profile?.full_name || profile?.username} size="md" className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <textarea
            value={caption}
            onChange={e => { setCaption(e.target.value); setFocused(true) }}
            onFocus={() => setFocused(true)}
            placeholder="What's on your mind?"
            rows={focused || caption ? 3 : 1}
            className="w-full resize-none bg-transparent border-0 outline-none text-sm text-gray-900 placeholder:text-gray-400 leading-relaxed transition-all duration-200"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-3">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-900/70 hover:bg-gray-900 text-white p-1.5 rounded-lg transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}

          {/* Action bar — only shown when focused */}
          {(focused || caption || preview) && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-1 -ml-1.5">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" id="inline-image-upload" />
                <label
                  htmlFor="inline-image-upload"
                  className="btn-ghost py-1.5 px-2.5 text-sm text-gray-500 cursor-pointer"
                >
                  <ImagePlus size={17} strokeWidth={1.8} className="text-[#8B5CF6]" />
                  <span>Photo</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                {(focused && !caption && !imageFile) && (
                  <button
                    type="button"
                    onClick={() => setFocused(false)}
                    className="btn-ghost text-gray-500 py-1.5 px-3 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!canPost}
                  className="btn-primary py-1.5 px-4 text-sm"
                >
                  {createPost.isPending ? (
                    <><Spinner size="sm" /><span>Posting...</span></>
                  ) : (
                    <><Send size={14} /><span>Post</span></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [toast, setToast] = useState(null)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePosts()

  const { data: stories } = useStories()

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

      {/* Stories Timeline */}
      <div className="card p-4">
        <StoriesRow stories={stories || []} />
      </div>

      {/* Inline Create Post */}
      <CreatePostBox onPostSuccess={() => setToast('Post published successfully!')} />

      {/* Feed label */}
      <div className="flex items-center gap-2 px-1">
        <Rss size={15} className="text-[#8B5CF6]" />
        <h2 className="font-bold text-gray-900 text-sm">Your Feed</h2>
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
          <p className="text-red-500 font-semibold">Failed to load posts.</p>
          <p className="text-gray-400 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && !error && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Rss size={28} className="text-[#8B5CF6]" />
          </div>
          <h3 className="font-bold text-gray-800 text-base mb-1">Your feed is empty</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Follow people or create your first post — it'll show up here.
          </p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Spinner />}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

