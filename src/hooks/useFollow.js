import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useFollow(targetUserId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: followStatus } = useQuery({
    queryKey: ['follow', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId || user.id === targetUserId) return false
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()
      if (error) throw error
      return !!data
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  })

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      if (followStatus) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow', user.id, targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] })
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['following', user.id] })
    },
  })

  return { isFollowing: followStatus ?? false, toggleFollow: toggle.mutate, isPending: toggle.isPending }
}

export function useFollowCounts(userId) {
  const { data: followerCount = 0 } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
  })

  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
  })

  return { followerCount, followingCount }
}
