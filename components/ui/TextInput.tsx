import { useState } from 'react'
import { TextInput as RNTextInput, StyleSheet, type TextInputProps as RNTextInputProps } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize } from '@/constants/theme'

export function TextInput(props: RNTextInputProps) {
  const [focused, setFocused] = useState(false)
  const theme = useTheme()

  return (
    <RNTextInput
      placeholderTextColor={theme.textFaint}
      style={[
        styles.base,
        { borderColor: focused ? theme.accentSoft : theme.border, color: theme.text, backgroundColor: theme.surface },
        props.style,
      ]}
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
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
  },
})
