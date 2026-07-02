import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'
import { colors, fontSize, fontWeight } from '@/constants/theme'

type Variant = 'heading' | 'body' | 'caption' | 'label'

type TextProps = RNTextProps & {
  variant?: Variant
  color?: string
}

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  return <RNText style={[styles[variant], color ? { color } : undefined, style]} {...props} />
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.light as any,
    color: colors.stone800,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal as any,
    color: colors.stone700,
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal as any,
    color: colors.stone500,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as any,
    color: colors.stone500,
  },
})
