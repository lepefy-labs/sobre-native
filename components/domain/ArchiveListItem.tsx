import type { JSX } from 'react'
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

const BODY_PREVIEW_LIMIT = 88

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
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: theme.borderSubtle, opacity: pressed ? 0.78 : 1 },
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.iconCol, { backgroundColor: theme.surfaceMuted }]}> 
        <TypeIcon color={theme.textMuted} size={18} />
      </View>

      <View style={styles.contentCol}>
        <Text style={[typography.body, styles.label, { color: theme.textSecondary }]} numberOfLines={2}>
          {label}
        </Text>
        <View style={styles.metaRow}>
          {MoodIcon && moodColor && (
            <View style={styles.moodMeta}>
              <MoodIcon color={moodColor} size={13} />
            </View>
          )}
          <Text style={[typography.caption, { color: theme.textFaint }]}>
            {formatTime(entry.sentAt, timezone)}
          </Text>
        </View>
      </View>

      <Text style={[styles.chevron, { color: theme.textFaint }]}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  iconCol: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
  },
  label: {
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 5,
  },
  moodMeta: {
    marginRight: 2,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 26,
  },
})
