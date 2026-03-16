import Avatar from '../ui/Avatar'

export default function StoryCircle({ group, isOwn = false }) {
  const profile = group?.profile
  const name = profile?.full_name || profile?.username || 'Unknown'
  const firstName = name.split(' ')[0]
  const hasStories = (group?.stories?.length ?? 0) > 0
  const allViewed = group?.allViewed
  const imageUrl = profile?.avatar_url

  // "Add Story" card — own circle with no stories
  if (isOwn && !hasStories) {
    return (
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
        <div className="relative">
          {/* Dashed ring for empty own story */}
          <div className="w-[60px] h-[60px] rounded-full p-[2px] border-2 border-dashed border-[#8B5CF6]/50 group-hover:border-[#8B5CF6] transition-colors duration-200 group-hover:scale-105 transform">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Avatar src={null} alt={name} size="lg" className="w-full h-full" />
              )}
            </div>
          </div>
          {/* Plus badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#8B5CF6] border-2 border-white flex items-center justify-center group-hover:bg-[#7C3AED] transition-colors duration-200">
            <span className="text-white text-xs font-bold leading-none">+</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 font-semibold truncate w-16 text-center group-hover:text-[#8B5CF6] transition-colors duration-200">
          Your Story
        </span>
      </div>
    )
  }

  // Regular story circle
  const ringStyle = allViewed
    ? { background: '#D1D5DB' }           // gray-300
    : { background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)' }

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
      <div className="relative">
        <div
          className="w-[60px] h-[60px] rounded-full p-[2.5px] group-hover:scale-105 transform transition-transform duration-200"
          style={ringStyle}
        >
          <div className="w-full h-full rounded-full p-[2px] bg-white overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Avatar src={null} alt={name} size="lg" className="w-full h-full" />
            )}
          </div>
        </div>

        {/* Multiple stories badge */}
        {hasStories && (group?.stories?.length ?? 0) > 1 && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#8B5CF6] border-2 border-white flex items-center justify-center">
            <span className="text-white text-[9px] font-bold leading-none">{group.stories.length}</span>
          </div>
        )}
      </div>
      <span className={`text-xs font-semibold truncate w-16 text-center transition-colors duration-200 ${
        allViewed ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-700 group-hover:text-[#8B5CF6]'
      }`}>
        {isOwn ? 'You' : firstName}
      </span>
    </div>
  )
}

