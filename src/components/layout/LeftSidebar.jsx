import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Compass, Bell, Bookmark, Settings, LogOut,
  Users, Film, PlusCircle, MessageSquare, Mail
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { useFollowCounts } from '../../hooks/useFollow'
import PostCreateModal from '../post/PostCreateModal'

const NAV_ITEMS = [
  { icon: Home, label: 'News Feed', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Film, label: 'Stories', path: '/stories' },
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: Mail, label: 'Messages', path: '/messages', badge: 0 },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
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

  const postCount = 0

  return (
    <div className="space-y-3">

      {/* Profile card */}
      <div className="card">
        {/* Cover gradient */}
        <div className="h-14 rounded-t-xl" style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%)'
        }} />
        <div className="px-4 pb-4">
          <Link to={`/profile/${user?.id}`} className="block group -mt-6 mb-3">
            <div className="relative inline-block">
              <div className="p-0.5 rounded-full" style={{
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                display: 'inline-block'
              }}>
                <div className="bg-white rounded-full p-0.5">
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || profile?.username}
                    size="lg"
                  />
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="mt-1.5">
              <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {profile?.full_name || 'Your Name'}
              </p>
              <p className="text-xs text-gray-500">@{profile?.username || 'username'}</p>
            </div>
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-gray-100">
            {[
              { label: 'Posts', value: postCount },
              { label: 'Followers', value: followerCount },
              { label: 'Following', value: followingCount },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-0.5 group cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <p className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Post */}
      <button
        onClick={() => setShowCreate(true)}
        className="btn-primary w-full py-2.5 text-sm"
      >
        <PlusCircle size={16} />
        Create Post
      </button>

      {/* Navigation */}
      <div className="card p-2 space-y-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={location.pathname === path ? 2.2 : 1.7} />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="badge">{badge}</span>
            )}
          </Link>
        ))}
        <div className="border-t border-gray-100 mt-1 pt-1">
          <button
            onClick={handleSignOut}
            className="w-full nav-link text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} strokeWidth={1.7} />
            Sign out
          </button>
        </div>
      </div>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
