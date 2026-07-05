import { View, StyleSheet, useColorScheme, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize, fontWeight, typography, gradient } from '@/constants/theme'
import { getT } from '@/lib/i18n'
import type { ContentLang, ContentType } from '@/types/database'

type ContentCardProps = {
  content: {
    type: ContentType
    title: string | null
    body: string
    tags: string[]
  }
  lang?: ContentLang
  style?: ViewStyle
}

export function ContentCard({ content, lang = 'it', style }: ContentCardProps) {
  const t = getT(lang)
  const theme = useTheme()
  const scheme = useColorScheme()
  const tags = content.tags.slice(0, 3)
  const cardGradient = gradient[scheme === 'dark' ? 'dark' : 'light'].byContentType[content.type]

  return (
    <LinearGradient
      colors={cardGradient}
      style={[styles.card, { borderColor: theme.borderSubtle }, style]}
    >
      {content.type === 'story' && content.title && (
        <Text style={[typography.caption, styles.storyTitle, { color: theme.textFaint }]}>
          {content.title.toUpperCase()}
        </Text>
      )}

      {content.type === 'tip' && (
        <Text style={[typography.caption, styles.tipBadge, { color: theme.accent }]}>
          {t.dashboard.content.tipLabel.toUpperCase()}
        </Text>
      )}

      <Text
        style={[typography.body, { color: theme.textSecondary }, content.type === 'thought' && styles.thoughtBody]}
      >
        {content.body}
      </Text>

      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tagPill, { backgroundColor: theme.surfaceMuted }]}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyTitle: {
    fontWeight: fontWeight.medium as any,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  tipBadge: {
    fontWeight: fontWeight.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  thoughtBody: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.light as any,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  tagPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
})
