import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { fontSize, fontWeight } from '@/constants/theme'

type Variant = 'heading' | 'body' | 'caption' | 'label'

type TextProps = RNTextProps & {
  variant?: Variant
  color?: string
}

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  const theme = useTheme()
  const variantColor: Record<Variant, string> = {
    heading: theme.text,
    body: theme.textSecondary,
    caption: theme.textMuted,
    label: theme.textMuted,
  }

  return (
    <RNText
      style={[styles[variant], { color: variantColor[variant] }, color ? { color } : undefined, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.light as any,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal as any,
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal as any,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as any,
  },
})
