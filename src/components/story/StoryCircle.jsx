import Avatar from '../ui/Avatar'

export default function StoryCircle({ story, isOwn = false }) {
  const profile = story?.profiles
  const name = profile?.full_name || profile?.username || 'Unknown'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
      <div className="relative">
        {/* Gradient ring */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-400 via-accent-500 to-pink-400 p-0.5">
          <div className="w-full h-full rounded-full bg-white p-0.5">
            {story?.image_url ? (
              <img
                src={story.image_url}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Avatar src={profile?.avatar_url} alt={name} size="lg" className="w-full h-full" />
            )}
          </div>
        </div>
        {isOwn && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">+</span>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600 font-medium truncate w-16 text-center group-hover:text-primary-600 transition-colors">
        {isOwn ? 'Your Story' : name.split(' ')[0]}
      </span>
    </div>
  )
}
