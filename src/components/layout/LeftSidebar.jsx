import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Compass, Bell, Bookmark, Settings, LogOut,
  Users, Film, PlusCircle, MessageSquare, Mail
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { useFollowCounts } from '../../hooks/useFollow'
import { useNotifications } from '../../hooks/useNotifications'
import PostCreateModal from '../post/PostCreateModal'

const NAV_ITEMS = [
  { icon: Home, label: 'Feed', path: '/' },
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
  const { unreadCount } = useNotifications()

  // Dynamically inject badges
  const dynamicNavItems = NAV_ITEMS.map(item => {
    if (item.path === '/notifications') {
      return { ...item, badge: unreadCount }
    }
    return item
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const postCount = 0

  return (
    <div className="space-y-4">

      {/* Modern Profile Card */}
      <div className="card p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/profile/${user?.id}`)}>
        <div className="relative mb-3 group">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || profile?.username}
            size="lg"
            className="ring-2 ring-offset-2 ring-transparent group-hover:ring-[#8B5CF6] transition-all duration-200"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        </div>
        
        <div className="text-center group">
          <p className="font-bold text-gray-900 text-base group-hover:text-[#8B5CF6] transition-colors">
            {profile?.full_name || 'Your Name'}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">@{profile?.username || 'username'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full pt-4 mt-4 border-t border-gray-100">
          {[
            { label: 'Posts', value: postCount },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
          ].map(({ label, value }) => (
            <div key={label} className="text-center py-1 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="card p-3 space-y-1">
        {dynamicNavItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#F3F4F6] text-[#8B5CF6]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#8B5CF6]' : ''} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="badge">{badge}</span>
              )}
            </Link>
          )
        })}
        
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </nav>

      {/* Create Post */}
      <button
        onClick={() => setShowCreate(true)}
        className="btn-primary w-full py-3 text-sm shadow-sm"
      >
        <PlusCircle size={18} />
        Create Post
      </button>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
