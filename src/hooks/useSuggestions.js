import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSuggestions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['suggestions', user?.id],
    queryFn: async () => {
      if (!user) return []
      // Get already-followed user IDs
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = follows ? follows.map(f => f.following_id) : []
      followingIds.push(user.id) // exclude self

      // Get profiles not in the follow list
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .limit(5)

      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}
