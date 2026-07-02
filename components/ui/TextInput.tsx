import { useState } from 'react'
import { TextInput as RNTextInput, StyleSheet, type TextInputProps as RNTextInputProps } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/constants/theme'

export function TextInput(props: RNTextInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <RNTextInput
      placeholderTextColor={colors.stone400}
      style={[styles.base, focused && styles.focused, props.style]}
      onFocus={(e) => {
        setFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.stone200,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.stone800,
    backgroundColor: colors.white,
  },
  focused: {
    borderColor: colors.amber400,
  },
})
