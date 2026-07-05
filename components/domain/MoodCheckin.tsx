import { useEffect, useRef, useState } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'
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
import { spacing, typography, fontWeight } from '@/constants/theme'
import { getT } from '@/lib/i18n'
import {
  MoodScatteredIcon,
  MoodReflectiveIcon,
  MoodCalmIcon,
  MoodBalancedIcon,
  MoodFocusedIcon,
  type IconProps,
} from '@/components/ui/icons'
import type { ContentLang, MoodValue, NotificationSlot } from '@/types/database'

type MoodCheckinProps = {
  slot: NotificationSlot
  initialMood: MoodValue | null
  onSave: (value: MoodValue) => Promise<void>
  lang?: ContentLang
}

const MOODS: { value: MoodValue; Icon: (props: IconProps) => JSX.Element }[] = [
  { value: 'very_low', Icon: MoodScatteredIcon },
  { value: 'low', Icon: MoodReflectiveIcon },
  { value: 'neutral', Icon: MoodCalmIcon },
  { value: 'good', Icon: MoodBalancedIcon },
  { value: 'great', Icon: MoodFocusedIcon },
]

const DEFAULT_INDEX = 2
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 }

function indexOfMood(mood: MoodValue | null): number | null {
  if (!mood) return null
  const idx = MOODS.findIndex((m) => m.value === mood)
  return idx === -1 ? null : idx
}

export function MoodCheckin({ slot: _slot, initialMood, onSave, lang = 'it' }: MoodCheckinProps) {
  const t = getT(lang)
  const theme = useTheme()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(indexOfMood(initialMood))
  const [isRecorded, setIsRecorded] = useState(initialMood !== null)
  const lastHapticIndexRef = useRef(selectedIndex ?? DEFAULT_INDEX)
  const confirmedOpacity = useSharedValue(initialMood !== null ? 1 : 0)

  useEffect(() => {
    const idx = indexOfMood(initialMood)
    if (idx !== null) {
      setSelectedIndex(idx)
      setIsRecorded(true)
      lastHapticIndexRef.current = idx
    }
  }, [initialMood])

  useEffect(() => {
    if (isRecorded) confirmedOpacity.value = withTiming(1, { duration: 300 })
  }, [isRecorded, confirmedOpacity])

  const confirmedStyle = useAnimatedStyle(() => ({ opacity: confirmedOpacity.value }))

  function commit(index: number) {
    setSelectedIndex(index)
    setIsRecorded(true)
    lastHapticIndexRef.current = index
    void onSave(MOODS[index].value).catch(() => {})
  }

  function handleTap(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    commit(index)
  }

  function handleSlideChange(value: number) {
    const index = Math.round(value)
    if (index !== lastHapticIndexRef.current) {
      lastHapticIndexRef.current = index
      setSelectedIndex(index)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  function handleSlideComplete(value: number) {
    commit(Math.round(value))
  }

  const displayIndex = selectedIndex ?? DEFAULT_INDEX

  return (
    <View>
      <Text variant="caption" color={theme.textFaint}>
        {t.dashboard.mood.question}
      </Text>

      <View style={styles.row}>
        {MOODS.map((mood, index) => (
          <MoodOption
            key={mood.value}
            Icon={mood.Icon}
            isSelected={selectedIndex === index}
            selectedColor={theme.accent}
            unselectedColor={theme.textFaint}
            onPress={() => handleTap(index)}
          />
        ))}
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={MOODS.length - 1}
        step={1}
        value={displayIndex}
        onValueChange={handleSlideChange}
        onSlidingComplete={handleSlideComplete}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.border}
        thumbTintColor={theme.accent}
      />

      <View style={styles.labelsRow}>
        {MOODS.map((mood, index) => {
          const isSelected = selectedIndex === index
          return (
            <Text
              key={mood.value}
              style={[
                typography.caption,
                styles.label,
                { color: isSelected ? theme.text : theme.textFaint },
                isSelected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {t.dashboard.mood.options[mood.value]}
            </Text>
          )
        })}
      </View>

      {isRecorded && (
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
  Icon: (props: IconProps) => JSX.Element
  isSelected: boolean
  selectedColor: string
  unselectedColor: string
  onPress: () => void
}

function MoodOption({ Icon, isSelected, selectedColor, unselectedColor, onPress }: MoodOptionProps) {
  const scale = useSharedValue(isSelected ? 1.1 : 1)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    scale.value = isSelected ? withSequence(withSpring(1.15), withSpring(1.1)) : withSpring(1)
  }, [isSelected, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable onPress={onPress} hitSlop={HIT_SLOP} style={styles.option}>
      <Animated.View style={animatedStyle}>
        <Icon color={isSelected ? selectedColor : unselectedColor} size={28} />
      </Animated.View>
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
  slider: {
    marginTop: spacing.xs,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
  labelSelected: {
    fontWeight: fontWeight.medium as any,
  },
  confirmed: {
    textAlign: 'right',
    marginTop: spacing.sm,
  },
})
