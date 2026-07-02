import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getLangFromStorage } from '@/lib/i18n'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import type { ContentLang, ContentType, MoodValue, NotificationSlot } from '@/types/database'

export type HomeContent = {
  type: ContentType
  title: string | null
  body: string
  tags: string[]
}

export function getSlotForTimezone(timezone: string): NotificationSlot {
  const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: timezone }).formatToParts(
    new Date()
  )
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  return hour >= 5 && hour < 18 ? 'morning' : 'evening'
}

export function getTodayDateString(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
}

export function useHomeData() {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const timezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const slot = useMemo(() => getSlotForTimezone(timezone), [timezone])
  const today = useMemo(() => getTodayDateString(timezone), [timezone])

  const langQuery = useQuery<ContentLang>({
    queryKey: ['lang-fallback'],
    queryFn: async () => (await getLangFromStorage()) ?? 'it',
    enabled: !profile,
    staleTime: Infinity,
  })

  const lang: ContentLang = profile?.lang ?? langQuery.data ?? 'it'

  const moodQuery = useQuery<MoodValue | null>({
    queryKey: ['today-mood', user?.id, slot, today],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('moods')
        .select('value')
        .eq('user_id', user.id)
        .eq('slot', slot)
        .eq('recorded_date', today)
        .maybeSingle()
      if (error) throw error
      return data?.value ?? null
    },
    enabled: !!user,
  })

  const contentQuery = useQuery<HomeContent | null>({
    queryKey: ['home-content', user?.id, slot, lang, moodQuery.data],
    queryFn: async () => {
      if (!user) return null

      const { data: rpcData, error: rpcError } = await supabase.rpc('get_today_content', {
        p_user_id: user.id,
        p_slot: slot,
      })
      if (rpcError) throw rpcError

      if (rpcData && rpcData.length > 0) {
        const row = rpcData[0]
        return { type: row.content_type, title: row.title, body: row.body, tags: row.tags }
      }

      let fallbackQuery = supabase
        .from('contents')
        .select('type, title, body, tags')
        .eq('lang', lang)
        .eq('slot', slot)
        .eq('is_active', true)

      fallbackQuery = moodQuery.data
        ? fallbackQuery.or(`mood_target.is.null,mood_target.eq.${moodQuery.data}`)
        : fallbackQuery.is('mood_target', null)

      const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(1).maybeSingle()
      if (fallbackError) throw fallbackError
      if (!fallbackData) return null

      return { type: fallbackData.type, title: fallbackData.title, body: fallbackData.body, tags: fallbackData.tags }
    },
    enabled: !!user && !moodQuery.isLoading,
  })

  return {
    content: contentQuery.data ?? null,
    todayMood: moodQuery.data ?? null,
    slot,
    userName: profile?.name ?? null,
    lang,
    isLoading: profileLoading || contentQuery.isLoading || moodQuery.isLoading,
    error: contentQuery.error ?? moodQuery.error ?? null,
  }
}
