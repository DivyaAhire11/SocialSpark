import { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useComments } from '../../hooks/useComments'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'
import { formatDistanceToNow } from 'date-fns'

export default function CommentSection({ postId, postAuthorId }) {
  const { user } = useAuth()
  const { comments, addComment, deleteComment, addingComment } = useComments(postId)
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment({ content: text.trim(), postAuthorId })
    setText('')
  }

  return (
    <div className="space-y-3">
      {/* Comment list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-2.5 group">
            <Avatar
              src={comment.profiles?.avatar_url}
              alt={comment.profiles?.full_name || comment.profiles?.username}
              size="xs"
            />
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-gray-800">
                    {comment.profiles?.username}
                  </span>
                  <span className="text-xs text-gray-400 ml-1.5">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                  <p className="text-xs text-gray-700 mt-0.5 leading-snug">{comment.content}</p>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No comments yet.</p>
        )}
      </div>

      {/* Add comment */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Avatar src={null} alt={user?.email} size="xs" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs
                         focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300
                         placeholder:text-gray-400 pr-9"
            />
            <button
              type="submit"
              disabled={!text.trim() || addingComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:opacity-30 transition-colors"
            >
              {addingComment ? <Spinner size="sm" /> : <Send size={13} />}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
