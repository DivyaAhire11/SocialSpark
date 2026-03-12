import { useState } from 'react'
import StoryCircle from './StoryCircle'
import AddStoryModal from './AddStoryModal'
import StoryViewerModal from './StoryViewerModal'
import { useAuth } from '../../hooks/useAuth'

export default function StoriesRow({ stories = [] }) {
  const { user, profile } = useAuth()
  
  const [uploadOpen, setUploadOpen] = useState(false)
  
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  // Determine if the current user has an active story
  const myStories = stories.filter(s => s.user_id === user?.id)
  const hasActiveStory = myStories.length > 0

  // The very first circle is always the "Add Story" or "Your Story" node
  const ownStoryCircle = {
    id: 'own',
    profiles: {
      id: user?.id,
      avatar_url: profile?.avatar_url,
      full_name: profile?.full_name,
      username: profile?.username,
    },
    image_url: hasActiveStory ? myStories[0].image_url : profile?.avatar_url,
  }

  // To prevent the viewer from breaking on "own" fake node, we only pass REAL stories to the viewer.
  // If the user clicks a friend's story circle, we open the viewer starting at that friend's index in the `stories` array.
  
  const handleStoryTap = (index) => {
    setViewerIndex(index)
    setViewerOpen(true)
  }

  const handleOwnTap = () => {
    // If they have an active story, they probably want to view it.
    // Assuming the requirement is to Add on click, we will just open Add modal,
    // or if they have stories, we can open the viewer on their stories.
    // For simplicity: Add story if none, open viewer if they have one.
    if (hasActiveStory) {
      // Find where their first story is in the array
      const sidx = stories.findIndex(s => s.user_id === user?.id)
      handleStoryTap(sidx)
    } else {
      setUploadOpen(true)
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        
        {/* Current User's Circle */}
        <div onClick={handleOwnTap}>
          <StoryCircle story={ownStoryCircle} isOwn={!hasActiveStory} />
        </div>

        {/* Real Stories from feed */}
        {stories.map((story, i) => (
          <div key={story.id} onClick={() => handleStoryTap(i)}>
            <StoryCircle story={story} />
          </div>
        ))}
      </div>

      {/* Modals placed outside the horizontal scroll flexbox to avoid clipping */}
      <AddStoryModal 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
      />

      <StoryViewerModal 
        stories={stories} 
        initialIndex={viewerIndex} 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
      />
    </>
  )
}
