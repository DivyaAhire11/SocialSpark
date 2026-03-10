import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, MessageCircle, PlusCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import PostCreateModal from '../post/PostCreateModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="SocialSpark"
              className="w-8 h-8 object-contain"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(124,58,237,0.3))' }}
            />
            <span className="text-base font-bold hidden sm:inline tracking-tight"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SocialSpark
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search people, posts..."
                className="w-full bg-gray-100 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm
                           text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-300
                           transition-all duration-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary py-1.5 px-3.5 text-sm hidden sm:flex"
            >
              <PlusCircle size={14} />
              <span className="hidden md:inline">New Post</span>
            </button>

            {/* Message icon */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <MessageCircle size={19} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
            </button>

            {/* Bell icon */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <Bell size={19} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Avatar */}
            <Link to={`/profile/${user?.id}`} className="ml-0.5">
              <div className="relative group cursor-pointer">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.full_name || profile?.username}
                  size="sm"
                  className="ring-2 ring-transparent group-hover:ring-blue-300 transition-all duration-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
