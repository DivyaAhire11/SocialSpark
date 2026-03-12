import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useConversations() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []

      // Fetch all messages involving the current user (sent or received)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, sender_id, receiver_id, read,
          sender:sender_id (id, username, full_name, avatar_url),
          receiver:receiver_id (id, username, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) return []

      // Group into unique conversations by the *other* user
      const conversationsMap = new Map()

      data.forEach(msg => {
        const isSender = msg.sender_id === user.id
        const otherUser = isSender ? msg.receiver : msg.sender
        const otherUserId = otherUser.id
        
        // If we haven't seen a message from this user yet, this is the most recent one.
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            otherUser,
            lastMessage: msg,
            unreadCount: (!isSender && !msg.read) ? 1 : 0
          })
        } else if (!isSender && !msg.read) {
          // Increment unread count for older messages in this conversation
          conversationsMap.get(otherUserId).unreadCount++
        }
      })

      return Array.from(conversationsMap.values())
    },
    enabled: !!user
  })
}

export function useChatMessages(otherUserId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', user?.id, otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return []

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, sender_id, receiver_id, read,
          sender:sender_id (id, username, full_name, avatar_url),
          receiver:receiver_id (id, username, full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Mark unread incoming messages as read
      const unreadIds = data
        .filter(m => m.receiver_id === user.id && !m.read)
        .map(m => m.id)

      if (unreadIds.length > 0) {
        // Fire and forget, don't block render
        supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds)
          .then(() => {
             queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
          })
      }

      return data ?? []
    },
    enabled: !!user && !!otherUserId,
  })

  // Set up Real-time Subscription for this specific chat
  useEffect(() => {
    if (!user || !otherUserId) return

    const channelName = `chat_${Math.min(user.id, otherUserId)}_${Math.max(user.id, otherUserId)}`
    
    // We subscribe to INSERT events on the messages table where the message belongs to this specific conversation
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}` // Note: filters on Supabase Realtime only support one eq per column, 
                                              // we will just listen to ALL inserts and filter client side if easier, 
                                              // or just invalidate to guarantee relationships are loaded.
        },
        () => {
           // When a new message drops in, strictly invalidate to fetch the new row + joined profile data.
           // We invalidate both the active chat and the sidebar list.
           queryClient.invalidateQueries({ queryKey: ['messages', user?.id, otherUserId] })
           queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, otherUserId, queryClient])

  return query
}

export function useSendMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ content, receiver_id }) => {
      if (!user || !content.trim() || !receiver_id) throw new Error('Invalid message payload')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          receiver_id: receiver_id,
          read: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      // Instantly update local chat cache so the sender sees it immediately
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, variables.receiver_id] })
      // Update sidebar latest message preview
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })
}
