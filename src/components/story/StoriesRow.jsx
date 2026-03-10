import StoryCircle from './StoryCircle'
import { useAuth } from '../../hooks/useAuth'

export default function StoriesRow({ stories = [] }) {
  const { user, profile } = useAuth()

  // Create a fake "own story" entry
  const ownStory = {
    id: 'own',
    profiles: {
      id: user?.id,
      avatar_url: profile?.avatar_url,
      full_name: profile?.full_name,
      username: profile?.username,
    },
    image_url: profile?.avatar_url,
  }

  const allStories = [ownStory, ...stories]

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      {allStories.map((story, i) => (
        <StoryCircle key={story.id} story={story} isOwn={i === 0} />
      ))}
      {stories.length === 0 && (
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400 py-2">No stories yet</p>
        </div>
      )}
    </div>
  )
}
