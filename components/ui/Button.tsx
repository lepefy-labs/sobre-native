import { Pressable, ActivityIndicator, StyleSheet, type GestureResponderEvent } from 'react-native'
import { Text } from './Text'
import { colors, spacing, radius, fontSize, fontWeight } from '@/constants/theme'

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

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.stone800} />
      ) : (
        <Text style={[styles.label, labelColor[variant]]}>{label}</Text>
      )}
    </Pressable>
  )
}

const labelColor = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.stone700 },
  ghost: { color: colors.stone500 },
})

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.stone800,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone200,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium as any,
  },
})
