import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'
import { useMarkStoryViewed } from '../../hooks/useStories'

const STORY_DURATION = 5000 // 5 seconds per image story
const SWIPE_CLOSE_THRESHOLD = 80 // pixels to trigger swipe-down close

export default function StoryViewerModal({ groupedStories, initialGroupIndex, isOpen, onClose }) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex || 0)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [dragY, setDragY] = useState(0)
  const touchStartY = useRef(null)
  const videoRef = useRef(null)
  const { mutate: markViewed } = useMarkStoryViewed()

  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIndex(initialGroupIndex || 0)
      setCurrentStoryIndex(0)
      setProgress(0)
      setDragY(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setIsPaused(false)
    }
  }, [isOpen, initialGroupIndex])

  const currentGroup = groupedStories?.[currentGroupIndex]
  const currentStory = currentGroup?.stories?.[currentStoryIndex]

  // Mark story as viewed
  useEffect(() => {
    if (isOpen && currentStory && !currentStory.viewed) {
      markViewed(currentStory.id)
    }
  }, [isOpen, currentStory, markViewed])

  const handleNext = () => {
    if (!currentGroup) return
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
      setProgress(0)
    } else if (currentGroupIndex < groupedStories.length - 1) {
      setCurrentGroupIndex(prev => prev + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
      setProgress(0)
    } else if (currentGroupIndex > 0) {
      const prevGroup = groupedStories[currentGroupIndex - 1]
      setCurrentGroupIndex(prev => prev - 1)
      setCurrentStoryIndex(prevGroup.stories.length - 1)
      setProgress(0)
    }
  }

  // Auto progression timer
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return
    const isVideo = currentStory.image_url?.match(/\.(mp4|webm|ogg)$/i)
    if (isVideo) return () => {}

    const interval = 50
    const step = (interval / STORY_DURATION) * 100
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer)
          handleNext()
          return 100
        }
        return p + step
      })
    }, interval)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroupIndex, currentStoryIndex, isOpen, isPaused, currentStory])

  // Video time update
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current
      if (duration > 0) setProgress((currentTime / duration) * 100)
    }
  }

  // ── Swipe-down-to-close handlers ──
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
    setIsPaused(true)
  }

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setDragY(dy) // only allow downward drag
  }

  const handleTouchEnd = () => {
    if (dragY >= SWIPE_CLOSE_THRESHOLD) {
      setDragY(0)
      touchStartY.current = null
      onClose()
    } else {
      setDragY(0)
      touchStartY.current = null
      setIsPaused(false)
    }
  }

  if (!isOpen || !groupedStories || groupedStories.length === 0) return null
  if (!currentGroup || !currentStory) { onClose(); return null }

  const profile = currentGroup.profile
  const isVideo = currentStory.image_url?.match(/\.(mp4|webm|ogg)$/i)
  const opacity = Math.max(0, 1 - dragY / 300)

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in"
      style={{ opacity }}
    >
      {/* Background close area */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Story Container */}
      <div
        className="relative w-full max-w-[400px] h-[100dvh] sm:h-[85vh] sm:rounded-2xl bg-gray-900 overflow-hidden shadow-2xl"
        style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.2s ease' : 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4 bg-gradient-to-b from-black/60 to-transparent">
          {currentGroup.stories.map((_, idx) => (
            <div key={idx} className="h-[3px] flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-none ease-linear"
                style={{
                  width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%',
                  transition: idx === currentStoryIndex ? 'none' : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Header */}
        <div className="absolute top-6 left-0 right-0 z-20 px-3 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar src={profile?.avatar_url} alt={profile?.username} size="sm" className="border-2 border-white/60 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm drop-shadow-md leading-tight">
                {profile?.username}
              </span>
              <span className="text-white/70 text-xs drop-shadow-md">
                {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Media Content */}
        <div
          className="w-full h-full flex items-center justify-center bg-zinc-900"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.image_url}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onEnded={handleNext}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <img
              src={currentStory.image_url}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Left/Right tap zones */}
        <div className="absolute top-20 bottom-0 left-0 w-1/3 z-10 cursor-w-resize" onClick={(e) => { e.stopPropagation(); handlePrev() }} />
        <div className="absolute top-20 bottom-0 right-0 w-2/3 z-10 cursor-e-resize" onClick={(e) => { e.stopPropagation(); handleNext() }} />

        {/* Desktop Navigation Arrows */}
        {(currentGroupIndex > 0 || currentStoryIndex > 0) && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev() }}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleNext() }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}
