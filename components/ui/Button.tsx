import { useRef } from 'react'
import { Pressable, Animated, ActivityIndicator, StyleSheet, type GestureResponderEvent } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text } from './Text'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '@/constants/theme'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = {
  label: string
  onPress: (event: GestureResponderEvent) => void
  disabled?: boolean
  loading?: boolean
  variant?: Variant
}

export function Button({ label, onPress, disabled, loading, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled || loading
  const theme = useTheme()
  const scale = useRef(new Animated.Value(1)).current

  function handlePressIn() {
    if (isDisabled) return
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start()
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start()
  }

  function handlePress(event: GestureResponderEvent) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress(event)
  }

  const backgroundColor =
    variant === 'primary' ? theme.primaryBg : variant === 'secondary' ? theme.surface : 'transparent'
  const labelColor =
    variant === 'primary' ? theme.onPrimary : variant === 'secondary' ? theme.textSecondary : theme.textMuted

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          {
            backgroundColor,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: theme.border,
          },
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium as any,
  },
})
