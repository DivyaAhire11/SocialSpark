import Avatar from '../ui/Avatar'

export default function StoryCircle({ group, isOwn = false }) {
  const profile = group?.profile
  const name = profile?.full_name || profile?.username || 'Unknown'

  // The image to show is the first story's image, or avatar if none
  const latestStory = group?.stories?.[0]
  const imageUrl = latestStory?.image_url || profile?.avatar_url

  const allViewed = group?.allViewed

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
      <div className="relative">
        {/* Colorful gradient ring vs gray ring vs own add story */}
        {isOwn && group?.stories?.length === 0 ? (
          <div className="w-14 h-14 rounded-full relative">
            <div className="w-full h-full rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <span className="text-blue-500 text-2xl font-light leading-none">+</span>
            </div>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full p-[2px]" style={{
            background: allViewed 
              ? '#E5E7EB' // gray-200
              : 'linear-gradient(135deg, #F43F5E 0%, #8B5CF6 50%, #2563EB 100%)'
          }}>
            <div className="w-full h-full rounded-full p-[2px] bg-white">
              {imageUrl ? (
                <img
                  src={imageUrl}
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
        {isOwn && group?.stories?.length === 0 ? 'Add Story' : name.split(' ')[0]}
      </span>
    </div>
  )
}
