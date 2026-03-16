import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Hook to get the list of conversations for the current user
export function useConversations() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []

      // 1. Get all conversations the user is a part of
      const { data: convos, error: convosError } = await supabase
        .from('participants')
        .select(`
          conversation_id,
          conversations (
            id,
            created_at,
            messages (
              id, content, created_at, sender_id, is_read
            )
          )
        `)
        .eq('user_id', user.id)

      if (convosError) throw convosError
      if (!convos) return []

      // 2. For each conversation, find the OTHER participant and the last message
      const results = await Promise.all(convos.map(async (item) => {
        const conversationId = item.conversation_id
        
        // Find other participants
        const { data: others, error: othersError } = await supabase
          .from('participants')
          .select('profiles (id, username, full_name, avatar_url)')
          .eq('conversation_id', conversationId)
          .neq('user_id', user.id)
          .single()

        if (othersError) {
          console.error("Error fetching other participant:", othersError)
          return null
        }

        const msgs = item.conversations.messages || []
        // Sort messages by created_at desc to get the last one
        msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        const lastMessage = msgs[0]

        if (!lastMessage) return null // Hide empty conversations if desired, or keep them

        return {
          id: conversationId,
          otherUser: others.profiles,
          lastMessage,
          unreadCount: msgs.filter(m => !m.is_read && m.sender_id !== user.id).length
        }
      }))

      return results.filter(Boolean).sort((a, b) => 
        new Date(b.lastMessage?.created_at) - new Date(a.lastMessage?.created_at)
      )
    },
    enabled: !!user
  })
}

// Hook to fetch messages for a specific conversation ID
export function useChatMessages(conversationId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return []

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, sender_id, is_read,
          sender:sender_id (id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Mark unread incoming messages as read
      const unreadIds = data
        .filter(m => m.sender_id !== user.id && !m.is_read)
        .map(m => m.id)

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)
          
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
      }

      return data ?? []
    },
    enabled: !!user && !!conversationId,
  })

  // Real-time Subscription
  useEffect(() => {
    if (!user || !conversationId) return

    const channel = supabase
      .channel(`room_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
           // Refetch messages and conversation list
           queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
           queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversationId, queryClient])

  return query
}

// Hook to send a message
export function useSendMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ content, conversationId }) => {
      if (!user || !content.trim() || !conversationId) throw new Error('Invalid message payload')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          conversation_id: conversationId,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })
}

// Hook to find or create a conversation with another user
export function useGetOrCreateConversation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (targetUserId) => {
      if (!user || !targetUserId) throw new Error('Missing IDs')

      // 1. Check if a conversation between these two already exists
      const { data: existing, error: checkError } = await supabase
        .rpc('get_conversation_with_user', { target_user_id: targetUserId })

      if (checkError) {
        // Fallback or complex query if RPC isn't available
        // For simplicity in this plan, let's assume we'll add the RPC or use a join
        // Let's use a standard query instead to be safe
        const { data: myConvos } = await supabase
          .from('participants')
          .select('conversation_id')
          .eq('user_id', user.id)
        
        const myIds = myConvos?.map(c => c.conversation_id) || []
        
        if (myIds.length > 0) {
          const { data: shared } = await supabase
            .from('participants')
            .select('conversation_id')
            .in('conversation_id', myIds)
            .eq('user_id', targetUserId)
            .maybeSingle()
          
          if (shared) return shared.conversation_id
        }
      } else if (existing) {
        return existing
      }

      // 2. Create new conversation
      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single()

      if (createError) throw createError

      // 3. Add both participants
      await supabase.from('participants').insert([
        { conversation_id: newConvo.id, user_id: user.id },
        { conversation_id: newConvo.id, user_id: targetUserId }
      ])

      return newConvo.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })
}
