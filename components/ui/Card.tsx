import { View, StyleSheet, type ViewProps } from 'react-native'
import { colors, spacing, radius } from '@/constants/theme'

type CardProps = ViewProps & {
  padding?: 'md' | 'lg'
}

export function Card({ padding = 'md', style, ...props }: CardProps) {
  return <View style={[styles.base, { padding: spacing[padding] }, style]} {...props} />
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone100,
    borderRadius: radius.lg,
  },
})
