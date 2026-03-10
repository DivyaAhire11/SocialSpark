import { useParams } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useUserPosts } from '../hooks/usePosts'
import { useFollow, useFollowCounts } from '../hooks/useFollow'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import PostCard from '../components/post/PostCard'
import { Camera, Grid, UserCheck, UserPlus } from 'lucide-react'

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="card p-6 flex flex-col items-center gap-4">
        <div className="skeleton w-24 h-24 rounded-full" />
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
        <div className="flex gap-8">
          {[1,2,3].map(i => <div key={i} className="skeleton h-8 w-16 rounded" />)}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser, profile: currentProfile } = useAuth()
  const isOwnProfile = currentUser?.id === userId

  const { data: profile, isLoading: profileLoading } = useProfile(userId)
  const { data: postsData, isLoading: postsLoading } = useUserPosts(userId)
  const { followerCount, followingCount } = useFollowCounts(userId)
  const { isFollowing, toggleFollow, isPending } = useFollow(userId)

  const posts = postsData?.pages.flat() ?? []

  if (profileLoading) return <ProfileSkeleton />

  if (!profile) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-400">User not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              size="2xl"
              ring={isOwnProfile}
            />
            {isOwnProfile && (
              <button className="absolute bottom-1 right-1 bg-gray-800 text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors">
                <Camera size={14} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-gray-400 text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-2 max-w-sm">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
              {[
                { label: 'Posts', value: posts.length },
                { label: 'Followers', value: followerCount },
                { label: 'Following', value: followingCount },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-bold text-gray-900">{value.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Follow button */}
          {!isOwnProfile && (
            <button
              onClick={() => toggleFollow()}
              disabled={isPending}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
            >
              {isPending
                ? <Spinner size="sm" />
                : isFollowing
                  ? <><UserCheck size={16} /> Following</>
                  : <><UserPlus size={16} /> Follow</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Posts grid header */}
      <div className="flex items-center gap-2 px-1 border-b border-gray-200 pb-3">
        <Grid size={18} className="text-primary-500" />
        <span className="font-semibold text-gray-700 text-sm">Posts</span>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <Camera size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No posts yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {isOwnProfile ? "Share your first moment!" : "This user hasn't posted yet."}
          </p>
        </div>
      )}
    </div>
  )
}
