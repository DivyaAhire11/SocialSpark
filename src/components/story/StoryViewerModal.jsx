import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'

const STORY_DURATION = 5000 // 5 seconds per image story

export default function StoryViewerModal({ stories, initialIndex, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0)
      setProgress(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setIsPaused(false)
    }
  }, [isOpen, initialIndex])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  // Auto progression mechanism
  useEffect(() => {
    if (!isOpen || isPaused) return

    const currentStory = stories[currentIndex]
    if (!currentStory) return

    const isVideo = currentStory.image_url?.match(/\.(mp4|webm|ogg)$/i)
    
    // For images, we use a fixed setInterval to update the progress bar smoothly
    if (!isVideo) {
      const interval = 50 // Update every 50ms
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
    } else {
      // For videos, progress is bound to the video's timeupdate event
      // We don't use the interval here
      return () => {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isOpen, isPaused, stories])

  // Handle Video time updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current
      if (duration > 0) {
        setProgress((currentTime / duration) * 100)
      }
    }
  }

  if (!isOpen || stories.length === 0) return null

  const story = stories[currentIndex]
  if (!story) {
    onClose()
    return null
  }

  const profile = story.profiles
  const isVideo = story.image_url?.match(/\.(mp4|webm|ogg)$/i)

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in">
      
      {/* Background close area */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Story Container */}
      <div className="relative w-full max-w-[400px] h-[100dvh] sm:h-[85vh] sm:rounded-2xl bg-gray-900 overflow-hidden shadow-2xl">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4 bg-gradient-to-b from-black/60 to-transparent">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Header */}
        <div className="absolute top-6 left-0 right-0 z-20 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={profile?.avatar_url} alt={profile?.username} size="sm" className="border border-white/50" />
            <span className="text-white font-medium text-sm drop-shadow-md">
              {profile?.username}
            </span>
            <span className="text-white/80 text-xs drop-shadow-md">
              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Media Content */}
        <div 
          className="w-full h-full flex items-center justify-center bg-zinc-900"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={story.image_url}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onEnded={handleNext}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <img 
              src={story.image_url} 
              alt="Story" 
              className="w-full h-full object-contain" 
            />
          )}
        </div>

        {/* Left/Right click zones */}
        <div 
          className="absolute top-20 bottom-0 left-0 w-1/3 z-10 cursor-w-resize" 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
        />
        <div 
          className="absolute top-20 bottom-0 right-0 w-2/3 z-10 cursor-e-resize" 
          onClick={(e) => { e.stopPropagation(); handleNext(); }} 
        />
        
        {/* Desktop Navigation Arrows (hidden on very small screens) */}
        {currentIndex > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={24} />
        </button>

      </div>
    </div>
  )
}
