import { useState, useMemo } from 'react'
import StoryCircle from './StoryCircle'
import AddStoryModal from './AddStoryModal'
import StoryViewerModal from './StoryViewerModal'
import { useAuth } from '../../hooks/useAuth'

export default function StoriesRow({ stories = [] }) {
  const { user, profile } = useAuth()
  
  const [uploadOpen, setUploadOpen] = useState(false)
  
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0)

  // Group stories by user and sort them
  const groupedStories = useMemo(() => {
    if (!stories || stories.length === 0) return []

    const groupsMap = new Map()
    
    stories.forEach(story => {
      if (!groupsMap.has(story.user_id)) {
        groupsMap.set(story.user_id, {
          user_id: story.user_id,
          profile: story.profiles,
          stories: [],
          allViewed: true,
        })
      }
      const group = groupsMap.get(story.user_id)
      group.stories.push(story)
      if (!story.viewed) group.allViewed = false
    })

    const groups = Array.from(groupsMap.values())

    return groups.sort((a, b) => {
      // 1. Current user always first
      if (a.user_id === user?.id) return -1
      if (b.user_id === user?.id) return 1
      
      // 2. Unviewed stories before viewed stories
      if (!a.allViewed && b.allViewed) return -1
      if (a.allViewed && !b.allViewed) return 1

      // 3. Newest first (based on most recent story in group)
      const newestA = new Date(a.stories[0].created_at).getTime()
      const newestB = new Date(b.stories[0].created_at).getTime()
      return newestB - newestA
    })
  }, [stories, user?.id])

  // Determine if the current user has an active story
  const hasActiveStory = groupedStories.some(g => g.user_id === user?.id)

  const handleGroupTap = (index) => {
    setViewerGroupIndex(index)
    setViewerOpen(true)
  }

  const handleOwnTap = () => {
    if (hasActiveStory) {
      const idx = groupedStories.findIndex(g => g.user_id === user?.id)
      handleGroupTap(idx)
    } else {
      setUploadOpen(true)
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        
        {/* Current User's Circle (Only if they have NO active stories, to act as the Add button) */}
        {!hasActiveStory && (
          <div onClick={handleOwnTap}>
            <StoryCircle 
              group={{
                user_id: user?.id,
                profile: {
                  id: user?.id,
                  avatar_url: profile?.avatar_url,
                  full_name: profile?.full_name,
                  username: profile?.username,
                },
                stories: [],
                allViewed: true
              }} 
              isOwn={true} 
            />
          </div>
        )}

        {/* Real Stories from feed */}
        {groupedStories.map((group, i) => (
          <div key={group.user_id} onClick={() => group.user_id === user?.id ? handleOwnTap() : handleGroupTap(i)}>
            <StoryCircle group={group} isOwn={group.user_id === user?.id} />
          </div>
        ))}
      </div>

      {/* Modals placed outside the horizontal scroll flexbox to avoid clipping */}
      <AddStoryModal 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
      />

      <StoryViewerModal 
        groupedStories={groupedStories} 
        initialGroupIndex={viewerGroupIndex} 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
      />
    </>
  )
}
