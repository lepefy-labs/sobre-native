import { useEffect, useRef } from 'react'
import { View, ScrollView, Animated, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ContentCard } from '@/components/domain/ContentCard'
import { MoodCheckin } from '@/components/domain/MoodCheckin'
import { useHomeData, getTodayDateString } from '@/hooks/useHomeData'
import { useProfile } from '@/hooks/useProfile'
import { useAuthContext } from '@/app/_layout'
import { supabase } from '@/lib/supabase'
import { getT } from '@/lib/i18n'
import { colors, spacing, radius } from '@/constants/theme'
import type { MoodValue } from '@/types/database'

export default function HomeScreen() {
  const { user } = useAuthContext()
  const { data: profile } = useProfile()
  const { content, todayMood, slot, userName, lang, isLoading } = useHomeData()
  const queryClient = useQueryClient()
  const t = getT(lang)

  const greeting = slot === 'morning' ? t.dashboard.home.greetingMorning : t.dashboard.home.greetingEvening

  async function saveMood(value: MoodValue) {
    if (!user) return
    const timezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
    const today = getTodayDateString(timezone)

    await supabase.from('moods').upsert(
      {
        user_id: user.id,
        value,
        slot,
        recorded_date: today,
        note: null,
      },
      { onConflict: 'user_id,slot,recorded_date' }
    )

    queryClient.invalidateQueries({ queryKey: ['today-mood'] })
    queryClient.invalidateQueries({ queryKey: ['home-content'] })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text variant="caption" color={colors.stone400} style={styles.greeting}>
            {greeting.toUpperCase()}
          </Text>
          {userName && (
            <Text variant="heading" style={styles.name}>
              {userName}
            </Text>
          )}

          {isLoading ? (
            <HomeSkeleton />
          ) : content ? (
            <ContentCard content={content} lang={lang} style={styles.card} />
          ) : (
            <Card padding="lg" style={styles.card}>
              <Text variant="body" color={colors.stone400} style={styles.emptyText}>
                {t.dashboard.home.emptyState}
              </Text>
            </Card>
          )}

          {!isLoading && (
            <View style={styles.moodWrap}>
              <MoodCheckin slot={slot} initialMood={todayMood} onSave={saveMood} lang={lang} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function HomeSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonBlock, { height: 80, opacity }]} />
      <Animated.View style={[styles.skeletonBlock, { height: 20, width: '60%', opacity }]} />
      <Animated.View style={[styles.skeletonBlock, { height: 20, width: '40%', opacity }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.stone50,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  greeting: {
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  name: {
    marginTop: spacing.xs,
  },
  card: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  moodWrap: {
    marginTop: spacing.xl,
  },
  skeletonBlock: {
    backgroundColor: colors.stone100,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
})
