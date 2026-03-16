import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, MessageCircle, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import PostCreateModal from '../post/PostCreateModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[#8B5CF6] text-white rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
              <span className="font-bold text-lg leading-none">S</span>
            </div>
            <span className="text-xl font-bold hidden sm:block tracking-tight text-gray-900 group-hover:text-[#8B5CF6] transition-colors duration-200">
              SocialSpark
            </span>
          </Link>

          {/* Center Search */}
          <div className="flex-1 max-w-lg hidden md:block px-4">
            <div className="relative group/search">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-[#8B5CF6] transition-colors" />
              <input
                type="text"
                placeholder="Search people or posts"
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm
                           text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:bg-white focus:border-transparent
                           transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary py-2 px-4 shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Create Post</span>
            </button>

            <div className="flex relative items-center gap-1.5 border-l border-gray-200 pl-3 ml-1">
              {/* Message icon */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-[#8B5CF6] hover:bg-purple-50 transition-all duration-200 hover:scale-105 active:scale-95">
                <MessageCircle size={22} strokeWidth={2} />
              </button>

              {/* Notification icon */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-[#8B5CF6] hover:bg-purple-50 transition-all duration-200 hover:scale-105 active:scale-95">
                <Bell size={22} strokeWidth={2} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Avatar Dropdown Area */}
              <Link to={`/profile/${user?.id}`} className="ml-2">
                <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-200">
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || profile?.username}
                    size="sm"
                    className="ring-2 ring-transparent group-hover:ring-[#8B5CF6] transition-all duration-200 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
