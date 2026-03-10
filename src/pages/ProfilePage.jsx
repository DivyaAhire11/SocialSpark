import { useParams } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useUserPosts } from '../hooks/usePosts'
import { useFollow, useFollowCounts } from '../hooks/useFollow'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import PostCard from '../components/post/PostCard'
import { Camera, Grid, UserCheck, UserPlus, ImageIcon } from 'lucide-react'

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-48 rounded" />
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
        <p className="text-gray-500 text-sm">User not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Profile header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              size="2xl"
            />
            {isOwnProfile && (
              <button className="absolute bottom-0.5 right-0.5 bg-white border border-gray-200 text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                <Camera size={13} />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={() => toggleFollow()}
                  disabled={isPending}
                  className={`sm:ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${isFollowing ? 'btn-following' : 'btn-follow'
                    }`}
                >
                  {isPending
                    ? <Spinner size="sm" />
                    : isFollowing
                      ? <><UserCheck size={15} /> Following</>
                      : <><UserPlus size={15} /> Follow</>
                  }
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-700 mt-2 max-w-md leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
              {[
                { label: 'Posts', value: posts.length },
                { label: 'Followers', value: followerCount },
                { label: 'Following', value: followingCount },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm ml-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Posts header */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <Grid size={15} className="text-gray-500" />
        <span className="font-semibold text-gray-800 text-sm">Posts</span>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton aspect-square rounded-lg" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ImageIcon size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600 text-sm">No posts yet</p>
          <p className="text-gray-400 text-xs mt-1">
            {isOwnProfile ? 'Share your first moment!' : "This user hasn't posted yet."}
          </p>
        </div>
      )}
    </div>
  )
}
