import { useEffect, useRef, useState } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { useTheme } from '@/hooks/useTheme'
import { spacing } from '@/constants/theme'
import { getT } from '@/lib/i18n'
import type { ContentLang, MoodValue, NotificationSlot } from '@/types/database'

type MoodCheckinProps = {
  slot: NotificationSlot
  initialMood: MoodValue | null
  onSave: (value: MoodValue) => Promise<void>
  lang?: ContentLang
}

const MOODS: { value: MoodValue; emoji: string }[] = [
  { value: 'very_low', emoji: '😔' },
  { value: 'low', emoji: '😕' },
  { value: 'neutral', emoji: '😐' },
  { value: 'good', emoji: '🙂' },
  { value: 'great', emoji: '😄' },
]

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 }

export function MoodCheckin({ slot: _slot, initialMood, onSave, lang = 'it' }: MoodCheckinProps) {
  const t = getT(lang)
  const theme = useTheme()
  const [selected, setSelected] = useState<MoodValue | null>(initialMood)
  const confirmedOpacity = useSharedValue(0)

  useEffect(() => {
    if (initialMood) setSelected(initialMood)
  }, [initialMood])

  useEffect(() => {
    if (selected) confirmedOpacity.value = withTiming(1, { duration: 300 })
  }, [selected, confirmedOpacity])

  const confirmedStyle = useAnimatedStyle(() => ({ opacity: confirmedOpacity.value }))

  function handlePress(value: MoodValue) {
    if (selected) return
    setSelected(value)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    void onSave(value).catch(() => {})
  }

  return (
    <View>
      <Text variant="caption" color={theme.textFaint}>
        {t.dashboard.mood.question}
      </Text>

      <View style={styles.row}>
        {MOODS.map((mood) => (
          <MoodOption
            key={mood.value}
            emoji={mood.emoji}
            isSelected={selected === mood.value}
            isDimmed={selected !== null && selected !== mood.value}
            disabled={selected !== null}
            onPress={() => handlePress(mood.value)}
          />
        ))}
      </View>

      {selected && (
        <Animated.View style={confirmedStyle}>
          <Text variant="caption" color={theme.textFaint} style={styles.confirmed}>
            {t.dashboard.mood.confirmed}
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

type MoodOptionProps = {
  emoji: string
  isSelected: boolean
  isDimmed: boolean
  disabled: boolean
  onPress: () => void
}

function MoodOption({ emoji, isSelected, isDimmed, disabled, onPress }: MoodOptionProps) {
  const scale = useSharedValue(isSelected ? 1.1 : 1)
  const opacity = useSharedValue(isDimmed ? 0.4 : 1)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    scale.value = isSelected ? withSequence(withSpring(1.15), withSpring(1.1)) : withSpring(1)
  }, [isSelected, scale])

  useEffect(() => {
    opacity.value = withTiming(isDimmed ? 0.4 : 1, { duration: 200 })
  }, [isDimmed, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={HIT_SLOP} style={styles.option}>
      <Animated.Text style={[styles.emoji, animatedStyle]}>{emoji}</Animated.Text>
      {isSelected && <View style={styles.selectionDot} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  option: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  selectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.xs,
    backgroundColor: '#f59e0b',
  },
  confirmed: {
    textAlign: 'right',
    marginTop: spacing.sm,
  },
})
