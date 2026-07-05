import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  SectionList,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { ContentCard } from '@/components/domain/ContentCard'
import { ArchiveListItem } from '@/components/domain/ArchiveListItem'
import { useArchive, type ArchiveEntry } from '@/hooks/useArchive'
import { useProfile } from '@/hooks/useProfile'
import { getT, getLangFromStorage } from '@/lib/i18n'
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
import type { ContentLang, ContentType, MoodValue } from '@/types/database'

type TypeFilter = ContentType | 'all'

type ArchiveSection = {
  title: string
  data: ArchiveEntry[]
}

const TYPE_FILTER_ICONS: Record<ContentType, (props: IconProps) => JSX.Element> = {
  thought: ContentThoughtIcon,
  story: ContentStoryIcon,
  tip: ContentTipIcon,
}

const MOOD_FILTER_ICONS: Record<MoodValue, (props: IconProps) => JSX.Element> = {
  very_low: MoodScatteredIcon,
  low: MoodReflectiveIcon,
  neutral: MoodCalmIcon,
  good: MoodBalancedIcon,
  great: MoodFocusedIcon,
}

const MOOD_ORDER: MoodValue[] = ['very_low', 'low', 'neutral', 'good', 'great']

const LOCALE_BY_LANG: Record<ContentLang, string> = { it: 'it-IT', fr: 'fr-FR' }

function toUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(dateString: string, days: number): string {
  const date = toUTCDate(dateString)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatSectionTitle(dateString: string, today: string, lang: ContentLang, t: ReturnType<typeof getT>): string {
  if (dateString === today) return t.archive.today
  if (dateString === addDays(today, -1)) return t.archive.yesterday

  const date = toUTCDate(dateString)
  const currentYear = toUTCDate(today).getUTCFullYear()
  const options: Intl.DateTimeFormatOptions =
    date.getUTCFullYear() === currentYear
      ? { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }
      : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }

  const formatted = new Intl.DateTimeFormat(LOCALE_BY_LANG[lang], options).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function groupIntoSections(
  entries: ArchiveEntry[],
  today: string,
  lang: ContentLang,
  t: ReturnType<typeof getT>
): ArchiveSection[] {
  const sections: ArchiveSection[] = []
  let currentDate: string | null = null
  let currentSection: ArchiveSection | null = null

  for (const entry of entries) {
    if (entry.sentDate !== currentDate) {
      currentDate = entry.sentDate
      currentSection = { title: formatSectionTitle(entry.sentDate, today, lang, t), data: [] }
      sections.push(currentSection)
    }
    currentSection!.data.push(entry)
  }

  return sections
}

export default function ArchiveScreen() {
  const theme = useTheme()
  const { data: profile } = useProfile()
  const [storedLang, setStoredLang] = useState<ContentLang | null>(null)

  useEffect(() => {
    getLangFromStorage().then(setStoredLang)
  }, [])

  const lang: ContentLang = profile?.lang ?? storedLang ?? 'it'
  const timezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const t = getT(lang)

  const { entries, isLoading, isFetchingNextPage, hasNextPage, hasReachedHistoryLimit, fetchNextPage } = useArchive()

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [moodFilters, setMoodFilters] = useState<Set<MoodValue>>(new Set())
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null)

  const today = useMemo(() => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date()), [timezone])

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false
      if (moodFilters.size > 0 && (!entry.mood || !moodFilters.has(entry.mood))) return false
      return true
    })
  }, [entries, typeFilter, moodFilters])

  const sections = useMemo(
    () => groupIntoSections(filteredEntries, today, lang, t),
    [filteredEntries, today, lang, t]
  )

  const hasAnyFilterActive = typeFilter !== 'all' || moodFilters.size > 0
  const isFilteredEmpty = entries.length > 0 && filteredEntries.length === 0 && hasAnyFilterActive

  function toggleMoodFilter(mood: MoodValue) {
    setMoodFilters((prev) => {
      const next = new Set(prev)
      if (next.has(mood)) next.delete(mood)
      else next.add(mood)
      return next
    })
  }

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  return (
    <View style={[styles.safe, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Text style={[typography.display, styles.title, { color: theme.text }]}>{t.archive.title}</Text>

        <FilterBar
          typeFilter={typeFilter}
          onSelectType={setTypeFilter}
          moodFilters={moodFilters}
          onToggleMood={toggleMoodFilter}
          t={t}
        />

        {isLoading ? (
          <ArchiveSkeleton />
        ) : entries.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text variant="body" color={theme.textMuted} style={styles.emptyText}>
              {t.archive.emptyState}
            </Text>
          </View>
        ) : isFilteredEmpty ? (
          <View style={styles.emptyWrap}>
            <Text variant="body" color={theme.textMuted} style={styles.emptyText}>
              {hasReachedHistoryLimit ? t.archive.emptyHistoryLimit : t.archive.emptyFiltered}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(entry) => entry.id}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={[typography.caption, styles.sectionHeader, { color: theme.textFaint }]}>
                {section.title.toUpperCase()}
              </Text>
            )}
            renderItem={({ item }) => (
              <ArchiveListItem entry={item} timezone={timezone} onPress={() => setSelectedEntry(item)} />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={theme.textFaint} />
                </View>
              ) : null
            }
            stickySectionHeadersEnabled={false}
          />
        )}
      </SafeAreaView>

      <Modal
        visible={selectedEntry !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEntry(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {selectedEntry && (
              <View style={styles.modalContent}>
                <ContentCard content={selectedEntry} lang={lang} onClose={() => setSelectedEntry(null)} />
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  )
}

type FilterBarProps = {
  typeFilter: TypeFilter
  onSelectType: (filter: TypeFilter) => void
  moodFilters: Set<MoodValue>
  onToggleMood: (mood: MoodValue) => void
  t: ReturnType<typeof getT>
}

function FilterBar({ typeFilter, onSelectType, moodFilters, onToggleMood, t }: FilterBarProps) {
  const theme = useTheme()

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t.archive.filterAll },
    { value: 'thought', label: t.dashboard.content.thoughtLabel },
    { value: 'story', label: t.dashboard.content.storyLabel },
    { value: 'tip', label: t.dashboard.content.tipLabel },
  ]

  return (
    <View style={styles.filterBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {typeOptions.map((option) => {
          const isSelected = typeFilter === option.value
          const Icon = option.value !== 'all' ? TYPE_FILTER_ICONS[option.value] : null
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelectType(option.value)}
              style={[
                styles.chip,
                { borderColor: theme.border },
                isSelected && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
              ]}
            >
              {Icon && <Icon color={isSelected ? theme.onPrimary : theme.textFaint} size={14} />}
              <Text style={[styles.chipText, { color: isSelected ? theme.onPrimary : theme.textSecondary }]}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {MOOD_ORDER.map((mood) => {
          const isSelected = moodFilters.has(mood)
          const Icon = MOOD_FILTER_ICONS[mood]
          return (
            <Pressable
              key={mood}
              onPress={() => onToggleMood(mood)}
              style={[
                styles.chip,
                { borderColor: theme.border },
                isSelected && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
              ]}
            >
              <Icon color={isSelected ? theme.onPrimary : theme.textFaint} size={14} />
              <Text style={[styles.chipText, { color: isSelected ? theme.onPrimary : theme.textSecondary }]}>
                {t.dashboard.mood.options[mood]}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function ArchiveSkeleton() {
  const theme = useTheme()
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.ease, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Animated.View
          key={index}
          style={[styles.skeletonRow, { opacity, backgroundColor: theme.surfaceMuted }]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  filterBar: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
  },
  skeletonWrap: {
    paddingHorizontal: spacing.xl,
  },
  skeletonRow: {
    height: 56,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.xl,
  },
})
