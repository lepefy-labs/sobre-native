import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { useAuth } from './useAuth'

export type ProfileWithSubscription = Profile & {
  stripe_customer_id: string | null
  current_period_end: string | null
}

export function useProfile() {
  const { user } = useAuth()

  return useQuery<ProfileWithSubscription | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'id, name, email, lang, notif_morning_time, notif_evening_time, notif_morning_enabled, notif_evening_enabled, onboarding_completed, subscription_status, created_at, updated_at, avatar_url, timezone, onesignal_player_id'
        )
        .eq('id', user.id)
        .single()
      if (error) throw error

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id, current_period_end')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        ...(profile as Profile),
        stripe_customer_id: subscription?.stripe_customer_id ?? null,
        current_period_end: subscription?.current_period_end ?? null,
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  })
}
