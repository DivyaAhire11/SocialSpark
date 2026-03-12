import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLikes(postId) {
  const { user } = useAuth()

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('post_id', postId)
      if (error) throw error
      return data
    },
    enabled: !!postId,
  })

  const isLiked = likes.some(l => l.user_id === user?.id)
  const likeCount = likes.length

  const queryClient = useQueryClient()

  const toggle = useMutation({
    mutationFn: async (postAuthorId) => {
      if (!user) throw new Error('Not authenticated')
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })
        if (error) throw error

        if (postAuthorId && postAuthorId !== user.id) {
          await supabase.from('notifications').insert({
              user_id: postAuthorId,
              actor_id: user.id,
              type: 'like',
              post_id: postId
          })
        }
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['likes', postId] })
      const prev = queryClient.getQueryData(['likes', postId])
      queryClient.setQueryData(['likes', postId], (old = []) =>
        isLiked
          ? old.filter(l => l.user_id !== user.id)
          : [...old, { id: 'temp', user_id: user.id }]
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['likes', postId], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId] })
    },
  })

  return { likes, isLiked, likeCount, toggleLike: toggle.mutate }
}
