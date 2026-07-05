import { useEffect, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  useColorScheme,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, typography, fonts, gradient } from '@/constants/theme'
import type { MoodValue } from '@/types/database'

const SCROLL_FADE_BOTTOM_THRESHOLD = 20

export default function HomeScreen() {
  const { user } = useAuthContext()
  const { data: profile } = useProfile()
  const { content, todayMood, slot, userName, lang, isLoading } = useHomeData()
  const queryClient = useQueryClient()
  const theme = useTheme()
  const scheme = useColorScheme()
  const t = getT(lang)

  const [viewportHeight, setViewportHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)

  const greeting = slot === 'morning' ? t.dashboard.home.greetingMorning : t.dashboard.home.greetingEvening
  const backgroundGradient = gradient[scheme === 'dark' ? 'dark' : 'light'][slot]

  const distanceFromBottom = contentHeight - viewportHeight - scrollOffset
  const showScrollFade = viewportHeight > 0 && contentHeight > viewportHeight && distanceFromBottom > SCROLL_FADE_BOTTOM_THRESHOLD

  function handleScrollViewLayout(event: LayoutChangeEvent) {
    setViewportHeight(event.nativeEvent.layout.height)
  }

  function handleContentSizeChange(_width: number, height: number) {
    setContentHeight(height)
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollOffset(event.nativeEvent.contentOffset.y)
  }

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
    <View style={[styles.safe, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={backgroundGradient} style={[StyleSheet.absoluteFill, styles.backgroundWash]} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.scrollWrap}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            onLayout={handleScrollViewLayout}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.hero}>
              <Text
                style={[typography.caption, styles.greeting, { fontFamily: fonts.serif.regular, color: theme.textFaint }]}
              >
                {greeting.toUpperCase()}
              </Text>
              {userName && (
                <Text style={[typography.display, styles.name, { fontFamily: fonts.serif.light, color: theme.text }]}>
                  {userName}
                </Text>
              )}
            </View>

            <View style={styles.middle}>
              {isLoading ? (
                <HomeSkeleton />
              ) : content ? (
                <ContentCard content={content} lang={lang} style={styles.card} />
              ) : (
                <Card padding="lg" style={[styles.card, styles.emptyCard]}>
                  <BreathingMark />
                  <Text variant="body" color={theme.textMuted} style={styles.emptyText}>
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

            <View style={styles.spacer} />

            <View style={styles.footer}>
              <Text style={[typography.caption, styles.footerText, { color: theme.textFootnote }]}>
                {t.dashboard.home.footerPayoff}
              </Text>
            </View>
          </ScrollView>
          {showScrollFade && (
            <LinearGradient colors={['transparent', theme.bg]} style={styles.scrollFade} pointerEvents="none" />
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

function BreathingMark() {
  const theme = useTheme()
  const scale = useRef(new Animated.Value(0.55)).current
  const opacity = useRef(new Animated.Value(0.7)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [scale, opacity])

  return (
    <Animated.View
      style={[
        styles.breatheMark,
        { borderColor: theme.accent, transform: [{ scale }], opacity },
      ]}
    />
  )
}

function HomeSkeleton() {
  const theme = useTheme()
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
      <Animated.View style={[styles.skeletonBlock, { height: 80, opacity, backgroundColor: theme.surfaceMuted }]} />
      <Animated.View
        style={[styles.skeletonBlock, { height: 20, width: '60%', opacity, backgroundColor: theme.surfaceMuted }]}
      />
      <Animated.View
        style={[styles.skeletonBlock, { height: 20, width: '40%', opacity, backgroundColor: theme.surfaceMuted }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backgroundWash: {
    opacity: 0.4,
  },
  scrollWrap: {
    flex: 1,
  },
  scrollFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  hero: {
    marginTop: 24,
  },
  middle: {
    marginTop: 32,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  name: {
    marginTop: spacing.xs,
  },
  card: {
    gap: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  breatheMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  emptyText: {
    textAlign: 'center',
  },
  moodWrap: {
    marginTop: spacing.xl,
  },
  footerText: {
    textAlign: 'center',
  },
  skeletonBlock: {
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
})
