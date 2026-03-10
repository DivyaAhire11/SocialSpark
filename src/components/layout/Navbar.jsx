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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-xl font-extrabold gradient-text">SocialSpark</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search people, posts..."
                className="w-full bg-gray-100 border-0 rounded-xl pl-9 pr-4 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white
                           transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 py-2 px-3 text-sm hidden sm:flex"
            >
              <PlusCircle size={16} />
              <span className="hidden md:inline">New Post</span>
            </button>

            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
              <MessageCircle size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <Link to={`/profile/${user?.id}`}>
              <Avatar
                src={profile?.avatar_url}
                alt={profile?.full_name || profile?.username}
                size="sm"
                ring
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        </div>
      </header>

      <PostCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
