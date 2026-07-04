import { View, StyleSheet, type ViewProps } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius } from '@/constants/theme'

type CardProps = ViewProps & {
  padding?: 'md' | 'lg'
}

export function Card({ padding = 'md', style, ...props }: CardProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding], backgroundColor: theme.surface, borderColor: theme.borderSubtle },
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.lg,
  },
})
