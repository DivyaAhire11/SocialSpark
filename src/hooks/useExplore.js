import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTrendingPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'trending'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 15
      const to = from + 14

      // To simulate "trending", we grab posts and ideally order them by engagement.
      // Supabase REST doesn't natively support ordering by a subquery count without a DB function/view.
      // For now, we fetch recent posts with their likes/comments and sort them client-side,
      // or simply rely on fetching recent ones to keep it "active".
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id),
          comments (id, content, created_at, profiles:user_id (id, username, avatar_url))
        `)
        // Ensure posts with images are prioritized for a grid visual
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      
      // Client-side sort by total engagement (likes + comments) to bubble popular active ones up
      if (data) {
        data.sort((a, b) => {
          const engA = (a.likes?.length || 0) + (a.comments?.length || 0)
          const engB = (b.likes?.length || 0) + (b.comments?.length || 0)
          return engB - engA
        })
        
        // Inside each post, optionally sort the comments by date
        data.forEach(post => {
          if (post.comments) {
             post.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          }
        })
      }

      return data ?? []
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 15 ? pages.length : undefined,
  })
}

export function useSearch(queryText) {
  return useQuery({
    queryKey: ['search', queryText],
    queryFn: async () => {
      if (!queryText.trim()) return { users: [], posts: [] }

      // Search Users by username or fullname
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${queryText}%,full_name.ilike.%${queryText}%`)
        .limit(5)

      if (userError) throw userError

      // Search Posts by caption
      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id),
          comments (id, content, created_at, profiles:user_id (id, username, avatar_url))
        `)
        .ilike('caption', `%${queryText}%`)
        // Also prioritize images for the grid
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(15)

      if (postError) throw postError

      return { users: users || [], posts: posts || [] }
    },
    enabled: queryText.length > 0,
  })
}
