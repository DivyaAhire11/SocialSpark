import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, ArrowLeft, MessageSquare, Search } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useConversations, useChatMessages, useSendMessage } from '../hooks/useMessages'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

import { useNavigate, useParams } from 'react-router-dom'

export default function MessagesPage() {
  const { user } = useAuth()
  const { conversationId } = useParams()
  const navigate = useNavigate()
  
  const [activeConversationId, setActiveConversationId] = useState(conversationId)
  
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId)
    }
  }, [conversationId])

  const handleConversationSelect = (id) => {
    setActiveConversationId(id)
    navigate(`/messages/${id}`)
  }

  // Left Panel data
  const { data: conversations, isLoading: isLoadingConvos } = useConversations()
  const activeConversation = conversations?.find(c => c.id === activeConversationId)

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] sm:h-[calc(100vh-theme(spacing.16))] py-4 sm:pt-4 sm:pb-8 flex flex-col">
      <div className="card flex-1 flex overflow-hidden border border-gray-100 shadow-sm relative">
        
        {/* Left Pane: Conversations List */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white transition-transform duration-300 ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
            <div className="mt-3 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all caret-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {isLoadingConvos ? (
              <div className="p-8 flex justify-center"><Spinner /></div>
            ) : conversations?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <MessageSquare className="mx-auto mb-2 text-gray-300" size={32} />
                No messages yet.
              </div>
            ) : (
              conversations?.map((conv) => {
                const { id, otherUser, lastMessage, unreadCount } = conv
                const isActive = id === activeConversationId
                
                return (
                  <button
                    key={id}
                    onClick={() => handleConversationSelect(id)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                      isActive ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="md" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-gray-900 truncate text-sm">
                          {otherUser.full_name || otherUser.username}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {lastMessage ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false }).replace('about ', '').replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd') : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {lastMessage ? (
                          <>{lastMessage.sender_id === user?.id ? 'You: ' : ''}{lastMessage.content}</>
                        ) : 'No messages'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className={`flex-1 flex flex-col bg-white ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          {activeConversationId && activeConversation ? (
            <ChatWindow 
              conversationId={activeConversationId}
              otherUser={activeConversation.otherUser} 
              onBack={() => navigate('/messages')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                <MessageSquare size={24} className="text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Messages</h3>
              <p className="text-sm max-w-xs leading-relaxed">
                Select a conversation from the sidebar or start a new message with a friend.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}


function ChatWindow({ conversationId, otherUser, onBack }) {
  const { user } = useAuth()
  const { data: messages, isLoading } = useChatMessages(conversationId)
  const sendMessage = useSendMessage()
  
  const [inputVal, setInputVal] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputVal.trim() || sendMessage.isPending) return

    const content = inputVal
    setInputVal('') // optimistic clear

    try {
      await sendMessage.mutateAsync({ content, conversationId })
    } catch (err) {
      setInputVal(content) // revert on fail
      alert('Failed to send message.')
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button 
          onClick={onBack}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <Link to={`/profile/${otherUser.id}`} className="flex items-center gap-3 group">
          <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="md" />
          <div>
            <p className="font-semibold text-gray-900 text-sm group-hover:text-[#8B5CF6] transition-colors">
              {otherUser.full_name || otherUser.username}
            </p>
            <p className="text-xs text-gray-500">@{otherUser.username}</p>
          </div>
        </Link>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-gray-50/50 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : messages?.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-10">
            This is the beginning of your chat history.
          </div>
        ) : (
          messages?.map((msg, i) => {
            const isMe = msg.sender_id === user?.id
            
            // Generate a time divider logic if the gap is > 1 hour
            const prevMsg = messages[i - 1]
            let showTimeDivider = false
            if (i === 0) showTimeDivider = true
            else if (prevMsg) {
              const diffMs = new Date(msg.created_at) - new Date(prevMsg.created_at)
              if (diffMs > 1000 * 60 * 60) showTimeDivider = true
            }

            return (
              <div key={msg.id} className="flex flex-col">
                {showTimeDivider && (
                  <div className="text-center text-[10px] text-gray-400 my-4 font-medium uppercase tracking-wider">
                    {format(new Date(msg.created_at), "MMM d, h:mm a")}
                  </div>
                )}
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {!isMe && (
                    <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="sm" className="hidden sm:block flex-shrink-0 mb-1" />
                  )}
                  <div className={`px-4 py-2 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-[#8B5CF6] text-white rounded-2xl rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
                {/* Read Receipt (only on latest message if sent by me) */}
                {isMe && i === messages.length - 1 && msg.is_read && (
                  <span className="text-[10px] text-gray-400 self-end mt-1 mr-1">Seen</span>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-transparent focus:border-[#8B5CF6] focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-full pl-5 pr-12 py-2.5 text-sm transition-all caret-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || sendMessage.isPending}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              inputVal.trim() ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]' : 'bg-transparent text-gray-300'
            }`}
          >
            <Send size={15} className="ml-0.5" />
          </button>
        </form>
      </div>

    </div>
  )
}
