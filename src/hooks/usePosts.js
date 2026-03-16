import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePosts() {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: ['posts', 'feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 10
      const to = from + 9

      // Get posts from people the user follows + their own posts
      const { data: follows } = user
        ? await supabase.from('follows').select('following_id').eq('follower_id', user.id)
        : { data: [] }

      const followingIds = follows ? follows.map(f => f.following_id) : []
      if (user) followingIds.push(user.id)

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id, content, created_at, profiles:user_id (id, username, avatar_url))
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      // Only restrict to followingIds if the user actually follows other people
      // or if we only want to show their own posts when they follow no one (Wait, requirements say: "If the user follows nobody, show recent public posts")
      // So if followingIds only contains themselves (length === 1), we should NOT filter, and show public posts
      if (followingIds.length > 1) {
        query = query.in('user_id', followingIds)
      }

      const { data, error } = await query
      if (error) throw error

      // Sort comments by created_at inside the feed data
      if (data) {
        data.forEach(post => {
          if (post.comments) {
             post.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          }
        })
      }

      return data ?? []
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length : undefined,
    enabled: true,
  })
}

export function useAllPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'all'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 10
      const to = from + 9
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return data ?? []
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length : undefined,
  })
}

export function useUserPosts(userId) {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 12
      const to = from + 11
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return data ?? []
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 12 ? pages.length : undefined,
    enabled: !!userId,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ caption, imageFile }) => {
      let image_url = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({ user_id: user.id, caption, image_url })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function usePost(postId) {
  return useQuery({
    queryKey: ['posts', 'single', postId],
    queryFn: async () => {
      if (!postId) return null
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id, content, created_at, profiles:user_id (id, username, avatar_url))
        `)
        .eq('id', postId)
        .single()
      if (error) throw error
      
      if (data?.comments) {
        data.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }
      
      return data
    },
    enabled: !!postId,
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
