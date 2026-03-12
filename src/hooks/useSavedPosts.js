import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Hook to get a user's entire list of saved posts
export function useAllSavedPosts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['saved_posts', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          id,
          post_id,
          created_at,
          posts (
            id,
            caption,
            image_url,
            created_at,
            user_id,
            profiles (
              id,
              username,
              avatar_url
            ),
            likes (id),
            comments (id)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

// Hook to manage the saved status of a specific post
export function useSavedStatus(postId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: isSaved = false } = useQuery({
    queryKey: ['saved_status', user?.id, postId],
    queryFn: async () => {
      if (!user || !postId) return false

      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!user && !!postId,
  })

  const toggleSaved = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ user_id: user.id, post_id: postId })
        if (error) throw error
      }
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['saved_status', user?.id, postId] })
      const prev = queryClient.getQueryData(['saved_status', user?.id, postId])
      queryClient.setQueryData(['saved_status', user?.id, postId], !isSaved)
      return { prev }
    },
    onError: (_, __, ctx) => {
      // Revert optimistic update
      queryClient.setQueryData(['saved_status', user?.id, postId], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved_status', user?.id, postId] })
      queryClient.invalidateQueries({ queryKey: ['saved_posts', user?.id] })
    }
  })

  return {
    isSaved,
    toggleSaved: toggleSaved.mutate,
    isPending: toggleSaved.isPending
  }
}
