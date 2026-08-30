import type { NotificationSlot } from '@/types/database'

export const ARCHIVE_WINDOW_DAYS = 14
export const ARCHIVE_MAX_HISTORY_MONTHS = 6

export function getSlotForTimezone(timezone: string, now: Date = new Date()): NotificationSlot {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: timezone,
  }).formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  return hour >= 5 && hour < 18 ? 'morning' : 'evening'
}

export function getDateStringForTimezone(timezone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now)
}

export function toUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(dateString: string, days: number): string {
  const date = toUTCDate(dateString)
  date.setUTCDate(date.getUTCDate() + days)
  return toDateString(date)
}

export function addMonths(dateString: string, months: number): string {
  const source = toUTCDate(dateString)
  const sourceDay = source.getUTCDate()
  const target = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1))
  const lastDayOfTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate()
  target.setUTCDate(Math.min(sourceDay, lastDayOfTargetMonth))
  return toDateString(target)
}

export function getArchiveInitialWindow(today: string): { lowerBound: string; upperBound: string } {
  return {
    lowerBound: addDays(today, -ARCHIVE_WINDOW_DAYS),
    upperBound: addDays(today, 1),
  }
}

export function getArchiveCutoffDate(today: string): string {
  return addMonths(today, -ARCHIVE_MAX_HISTORY_MONTHS)
}

export function getNextArchiveWindow(
  lowerBound: string,
  cutoffDate: string
): { lowerBound: string; upperBound: string } | undefined {
  if (lowerBound <= cutoffDate) return undefined

  const nextUpperBound = lowerBound
  const rawNextLowerBound = addDays(nextUpperBound, -ARCHIVE_WINDOW_DAYS)
  return {
    lowerBound: rawNextLowerBound < cutoffDate ? cutoffDate : rawNextLowerBound,
    upperBound: nextUpperBound,
  }
}
