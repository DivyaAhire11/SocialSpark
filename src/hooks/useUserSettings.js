import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useUserSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || {
        notify_likes: true,
        notify_comments: true,
        notify_followers: true
      }
    },
    enabled: !!user,
  })

  const updateSettings = useMutation({
    mutationFn: async (updates) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user_settings', user.id], data)
    },
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings
  }
}
