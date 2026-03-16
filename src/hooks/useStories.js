import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useStories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('stories')
        .select('*, profiles:user_id (id, username, full_name, avatar_url)')
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
      if (error) throw error

      if (!user) return data ?? []

      const { data: viewsData } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', user.id)

      const viewedIds = new Set(viewsData?.map(v => v.story_id) || [])

      return (data ?? []).map(story => ({
        ...story,
        viewed: viewedIds.has(story.id)
      }))
    },
    enabled: !!user,
  })
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (storyId) => {
      if (!user) return
      const { error } = await supabase
        .from('story_views')
        .upsert(
          { user_id: user.id, story_id: storyId },
          { onConflict: 'user_id, story_id' }
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

export function useCreateStory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (imageFile) => {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `story-${user.id}-${Date.now()}.${fileExt}`

      // Upload to the correct 'stories' bucket
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('stories').getPublicUrl(fileName)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          expires_at: expiresAt,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

