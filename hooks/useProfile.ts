import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
