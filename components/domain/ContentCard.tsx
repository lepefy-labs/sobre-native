import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { colors, spacing, radius, fontSize, fontWeight } from '@/constants/theme'
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
  const tags = content.tags.slice(0, 3)

  return (
    <Card padding="lg" style={[styles.card, style]}>
      {content.type === 'story' && content.title && (
        <Text style={styles.storyTitle}>{content.title.toUpperCase()}</Text>
      )}

      {content.type === 'tip' && (
        <Text style={styles.tipBadge}>{t.dashboard.content.tipLabel.toUpperCase()}</Text>
      )}

      <Text style={[styles.body, content.type === 'thought' && styles.thoughtBody]}>{content.body}</Text>

      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium as any,
    color: colors.stone400,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  tipBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
    color: colors.amber600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.stone700,
    lineHeight: 24,
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
    backgroundColor: colors.stone100,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.stone500,
  },
})
