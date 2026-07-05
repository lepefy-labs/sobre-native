import { Pressable, View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, typography } from '@/constants/theme'
import {
  ContentThoughtIcon,
  ContentStoryIcon,
  ContentTipIcon,
  MoodScatteredIcon,
  MoodReflectiveIcon,
  MoodCalmIcon,
  MoodBalancedIcon,
  MoodFocusedIcon,
  type IconProps,
} from '@/components/ui/icons'
import type { ArchiveEntry } from '@/hooks/useArchive'
import type { ThemeColors } from '@/constants/theme'
import type { ContentType, MoodValue } from '@/types/database'

const BODY_PREVIEW_LIMIT = 80

const TYPE_ICONS: Record<ContentType, (props: IconProps) => JSX.Element> = {
  thought: ContentThoughtIcon,
  story: ContentStoryIcon,
  tip: ContentTipIcon,
}

const MOOD_ICONS: Record<MoodValue, (props: IconProps) => JSX.Element> = {
  very_low: MoodScatteredIcon,
  low: MoodReflectiveIcon,
  neutral: MoodCalmIcon,
  good: MoodBalancedIcon,
  great: MoodFocusedIcon,
}

const MOOD_COLOR_KEYS: Record<MoodValue, keyof ThemeColors> = {
  very_low: 'moodVeryLow',
  low: 'moodLow',
  neutral: 'moodNeutral',
  good: 'moodGood',
  great: 'moodGreat',
}

function truncatePreview(body: string): string {
  if (body.length <= BODY_PREVIEW_LIMIT) return body
  const sliced = body.slice(0, BODY_PREVIEW_LIMIT)
  const lastSpace = sliced.lastIndexOf(' ')
  const boundary = lastSpace > 0 ? lastSpace : BODY_PREVIEW_LIMIT
  return `${sliced.slice(0, boundary).trimEnd()}…`
}

function formatTime(sentAt: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(
    new Date(sentAt)
  )
}

type ArchiveListItemProps = {
  entry: ArchiveEntry
  timezone: string
  onPress: () => void
}

export function ArchiveListItem({ entry, timezone, onPress }: ArchiveListItemProps) {
  const theme = useTheme()
  const TypeIcon = TYPE_ICONS[entry.type]
  const MoodIcon = entry.mood ? MOOD_ICONS[entry.mood] : null
  const moodColor = entry.mood ? theme[MOOD_COLOR_KEYS[entry.mood]] : undefined

  const label = entry.type === 'story' && entry.title ? entry.title : truncatePreview(entry.body)

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
    >
      <View style={styles.iconCol}>
        <TypeIcon color={theme.textFaint} size={18} />
      </View>

      {MoodIcon && moodColor && (
        <View style={styles.moodCol}>
          <MoodIcon color={moodColor} size={14} />
        </View>
      )}

      <Text style={[typography.body, styles.label, { color: theme.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>

      <Text style={[typography.caption, styles.time, { color: theme.textFaint }]}>{formatTime(entry.sentAt, timezone)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  iconCol: {
    marginRight: spacing.sm,
  },
  moodCol: {
    marginRight: spacing.sm,
  },
  label: {
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    minWidth: 44,
    textAlign: 'right',
  },
})
