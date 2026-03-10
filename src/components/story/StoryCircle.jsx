import Avatar from '../ui/Avatar'

export default function StoryCircle({ story, isOwn = false }) {
  const profile = story?.profiles
  const name = profile?.full_name || profile?.username || 'Unknown'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
      <div className="relative">
        {/* Colorful gradient ring */}
        {isOwn ? (
          <div className="w-14 h-14 rounded-full relative">
            <div className="w-full h-full rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <span className="text-blue-500 text-2xl font-light leading-none">+</span>
            </div>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full p-[2px]" style={{
            background: 'linear-gradient(135deg, #F43F5E 0%, #8B5CF6 50%, #2563EB 100%)'
          }}>
            <div className="w-full h-full rounded-full p-[2px] bg-white">
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
        )}
      </div>
      <span className="text-xs text-gray-600 font-medium truncate w-14 text-center group-hover:text-blue-600 transition-colors">
        {isOwn ? 'Add Story' : name.split(' ')[0]}
      </span>
    </div>
  )
}
