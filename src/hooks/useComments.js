import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useComments(postId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id (id, username, full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!postId,
  })

  const addComment = useMutation({
    mutationFn: async (content) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content })
        .select('*, profiles:user_id (id, username, full_name, avatar_url)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })

  const deleteComment = useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })

  return { comments, isLoading, addComment: addComment.mutate, deleteComment: deleteComment.mutate, addingComment: addComment.isPending }
}
