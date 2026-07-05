import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import { getTodayDateString } from './useHomeData'
import type { ContentType, MoodValue, NotificationSlot } from '@/types/database'

export type ArchiveEntry = {
  id: string
  sentAt: string
  sentDate: string
  slot: NotificationSlot
  type: ContentType
  title: string | null
  body: string
  tags: string[]
  mood: MoodValue | null
}

export type ArchivePageParam = {
  lowerBound: string
  upperBound: string
}

type ArchivePage = {
  entries: ArchiveEntry[]
  pageParam: ArchivePageParam
}

type NotificationJoinRow = {
  id: string
  sent_at: string
  sent_date: string
  slot: NotificationSlot
  contents: {
    id: string
    type: ContentType
    title: string | null
    body: string
    tags: string[]
  } | null
}

type MoodRow = {
  value: MoodValue
  slot: NotificationSlot
  recorded_date: string
}

const WINDOW_DAYS = 14
const MAX_HISTORY_MONTHS = 6

function toUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(dateString: string, days: number): string {
  const date = toUTCDate(dateString)
  date.setUTCDate(date.getUTCDate() + days)
  return toDateString(date)
}

function addMonths(dateString: string, months: number): string {
  const date = toUTCDate(dateString)
  date.setUTCMonth(date.getUTCMonth() + months)
  return toDateString(date)
}

function moodKey(recordedDate: string, slot: NotificationSlot): string {
  return `${recordedDate}_${slot}`
}

async function fetchArchivePage(userId: string, pageParam: ArchivePageParam): Promise<ArchiveEntry[]> {
  const { lowerBound, upperBound } = pageParam

  // Content is shown even if deactivated after being sent — the archive is a
  // record of what the user actually received, not of what's still live.
  const { data: notifRows, error: notifError } = await supabase
    .from('notifications')
    .select('id, sent_at, sent_date, slot, opened_at, contents!inner(id, type, title, body, tags)')
    .eq('user_id', userId)
    .gte('sent_date', lowerBound)
    .lt('sent_date', upperBound)
    .order('sent_date', { ascending: false })
    .order('sent_at', { ascending: false })
    .returns<NotificationJoinRow[]>()

  if (notifError) throw notifError

  const { data: moodRows, error: moodError } = await supabase
    .from('moods')
    .select('value, slot, recorded_date')
    .eq('user_id', userId)
    .gte('recorded_date', lowerBound)
    .lt('recorded_date', upperBound)
    .returns<MoodRow[]>()

  if (moodError) throw moodError

  const moodMap = new Map<string, MoodValue>()
  for (const mood of moodRows ?? []) {
    moodMap.set(moodKey(mood.recorded_date, mood.slot), mood.value)
  }

  return (notifRows ?? [])
    .filter((row): row is NotificationJoinRow & { contents: NonNullable<NotificationJoinRow['contents']> } =>
      row.contents !== null
    )
    .map((row) => ({
      id: row.id,
      sentAt: row.sent_at,
      sentDate: row.sent_date,
      slot: row.slot,
      type: row.contents.type,
      title: row.contents.title,
      body: row.contents.body,
      tags: row.contents.tags,
      mood: moodMap.get(moodKey(row.sent_date, row.slot)) ?? null,
    }))
}

export function useArchive() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const timezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = getTodayDateString(timezone)
  const cutoffDate = addMonths(today, -MAX_HISTORY_MONTHS)

  const initialPageParam: ArchivePageParam = {
    lowerBound: addDays(today, -WINDOW_DAYS),
    upperBound: addDays(today, 1),
  }

  const query = useInfiniteQuery({
    queryKey: ['archive', user?.id] as const,
    queryFn: async ({ pageParam }: { pageParam: ArchivePageParam }): Promise<ArchivePage> => {
      if (!user) return { entries: [], pageParam }
      const entries = await fetchArchivePage(user.id, pageParam)
      return { entries, pageParam }
    },
    initialPageParam,
    getNextPageParam: (lastPage: ArchivePage) => {
      if (lastPage.entries.length === 0) return undefined
      if (lastPage.pageParam.lowerBound <= cutoffDate) return undefined

      const nextUpperBound = lastPage.pageParam.lowerBound
      const rawNextLowerBound = addDays(nextUpperBound, -WINDOW_DAYS)
      const nextLowerBound = rawNextLowerBound < cutoffDate ? cutoffDate : rawNextLowerBound

      return { lowerBound: nextLowerBound, upperBound: nextUpperBound }
    },
    enabled: !!user,
  })

  const entries = query.data?.pages.flatMap((page) => page.entries) ?? []
  const hasReachedHistoryLimit = !query.hasNextPage && !query.isLoading

  return {
    entries,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    hasReachedHistoryLimit,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  }
}
