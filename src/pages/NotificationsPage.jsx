import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../hooks/useNotifications'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import PostDetailModal from '../components/post/PostDetailModal'
import { usePost } from '../hooks/usePosts'

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, unreadCount } = useNotifications()
  const [selectedPostId, setSelectedPostId] = useState(null)
  const { data: selectedPost } = usePost(selectedPostId)
  const navigate = useNavigate()

  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => {
        markAsRead()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount, markAsRead])

  const handleNotificationClick = (notif) => {
    if (notif.type === 'follow') {
      navigate(`/profile/${notif.actor.id}`)
    } else if (notif.post_id) {
      setSelectedPostId(notif.post_id)
    }
  }

  const renderIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-white" fill="currentColor" />
      case 'comment': return <MessageCircle size={16} className="text-white" fill="currentColor" />
      case 'follow': return <UserPlus size={16} className="text-white" />
      default: return <Bell size={16} className="text-white" />
    }
  }

  const renderIconBg = (type) => {
    switch (type) {
      case 'like': return 'bg-red-500'
      case 'comment': return 'bg-green-500'
      case 'follow': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const renderMessage = (notif) => {
    const actorName = notif.actor.full_name || notif.actor.username
    switch (notif.type) {
      case 'like': 
        return <><span className="font-semibold text-gray-900">{actorName}</span> liked your post.</>
      case 'comment': 
        return (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span> commented: 
            <span className="text-gray-600">"{notif.content}"</span>
          </>
        )
      case 'follow': 
        return <><span className="font-semibold text-gray-900">{actorName}</span> started following you.</>
      default: 
        return <><span className="font-semibold text-gray-900">{actorName}</span> interacted with you.</>
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="card p-4 border-b border-gray-100 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Bell className="text-[#8B5CF6]" size={20} />
          Notifications
        </h2>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1 text-lg">No notifications yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              When someone interacts with your posts or follows you, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.is_read ? 'bg-purple-50/40' : 'bg-white'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={notif.actor.avatar_url} alt={notif.actor.username} size="lg" />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${renderIconBg(notif.type)}`}>
                    {renderIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-gray-800 leading-snug pr-4">
                    {renderMessage(notif)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 shrink-0 bg-[#8B5CF6] rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal for like/comment notifications */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  )
}
