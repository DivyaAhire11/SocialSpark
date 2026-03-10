import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Compass, Bell, Bookmark, Settings, LogOut,
  Users, Film, PlusCircle
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { useFollowCounts } from '../../hooks/useFollow'
import PostCreateModal from '../post/PostCreateModal'

const NAV_ITEMS = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Film, label: 'Stories', path: '/stories' },
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function LeftSidebar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { followerCount, followingCount } = useFollowCounts(user?.id)
  const [showCreate, setShowCreate] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const postCount = 0 // Could be fetched separately

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="card p-5">
        <Link to={`/profile/${user?.id}`} className="flex flex-col items-center text-center group">
          <div className="relative">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.full_name || profile?.username}
              size="xl"
              ring
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <h3 className="mt-3 font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {profile?.full_name || 'Your Name'}
          </h3>
          <p className="text-sm text-gray-400">@{profile?.username || 'username'}</p>
          {profile?.bio && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{profile.bio}</p>
          )}
        </Link>

        <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          {[
            { label: 'Posts', value: postCount },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3"
      >
        <PlusCircle size={18} />
        New Post
      </button>

      {/* Navigation */}
      <div className="card p-3 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="w-full nav-link text-red-500 hover:bg-red-50 hover:text-red-600 mt-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
