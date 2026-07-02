import { useEffect, useRef, useState } from 'react'
import { View, Pressable, Animated, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { colors, spacing, fontSize } from '@/constants/theme'
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

export function MoodCheckin({ slot: _slot, initialMood, onSave, lang = 'it' }: MoodCheckinProps) {
  const t = getT(lang)
  const [selected, setSelected] = useState<MoodValue | null>(initialMood)
  const scales = useRef(
    Object.fromEntries(
      MOODS.map((mood) => [mood.value, new Animated.Value(mood.value === initialMood ? 1.4 : 1)])
    ) as Record<MoodValue, Animated.Value>
  ).current

  useEffect(() => {
    if (initialMood) setSelected(initialMood)
  }, [initialMood])

  function handlePress(value: MoodValue) {
    if (selected) return
    setSelected(value)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.spring(scales[value], { toValue: 1.4, useNativeDriver: true }).start()
    void onSave(value).catch(() => {})
  }

  return (
    <View>
      <Text variant="caption" color={colors.stone400}>
        {t.dashboard.mood.question}
      </Text>

      <View style={styles.row}>
        {MOODS.map((mood) => {
          const isSelected = selected === mood.value
          const isDimmed = selected !== null && !isSelected
          return (
            <Pressable key={mood.value} onPress={() => handlePress(mood.value)} disabled={selected !== null}>
              <Animated.Text
                style={[styles.emoji, { opacity: isDimmed ? 0.3 : 1, transform: [{ scale: scales[mood.value] }] }]}
              >
                {mood.emoji}
              </Animated.Text>
            </Pressable>
          )
        })}
      </View>

      {selected && (
        <Text variant="caption" color={colors.stone400} style={styles.confirmed}>
          {t.dashboard.mood.confirmed}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  emoji: {
    fontSize: 32,
  },
  confirmed: {
    textAlign: 'right',
    marginTop: spacing.sm,
  },
})
