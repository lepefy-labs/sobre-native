import { useRef, useState } from 'react'
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { ShareIcon } from '@/components/ui/icons'
import { ShareableContentCard, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT } from './ShareableContentCard'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize, fontWeight, typography, fonts, gradient } from '@/constants/theme'
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
  onClose?: () => void
}

export function ContentCard({ content, lang = 'it', style, onClose }: ContentCardProps) {
  const t = getT(lang)
  const theme = useTheme()
  const tags = content.tags.slice(0, 3)
  const shareCardRef = useRef<View>(null)
  const [isSharing, setIsSharing] = useState(false)
  const colors = gradient[theme.scheme].byContentType[content.type]

  async function handleShare() {
    if (isSharing) return
    setIsSharing(true)
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
      })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' })
      }
    } catch {
      // sharing is a non-critical UX path — fail silently
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <LinearGradient
      colors={colors}
      style={[styles.card, { borderColor: theme.borderSubtle }, style]}
    >
      <View style={styles.header}>
        <View style={styles.headerLabel}>
          {content.type === 'story' && content.title && (
            <Text style={[typography.caption, styles.storyTitle, { color: theme.textMuted }]}>
              {content.title.toUpperCase()}
            </Text>
          )}

          {content.type === 'tip' && (
            <View style={[styles.typeBadge, { backgroundColor: theme.surface }]}> 
              <Text style={[typography.caption, styles.tipBadge, { color: theme.accent }]}>
                {t.dashboard.content.tipLabel.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={handleShare}
            disabled={isSharing}
            hitSlop={10}
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            accessibilityRole="button"
          >
            <ShareIcon color={theme.textMuted} size={17} />
          </Pressable>

          {onClose && (
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={[styles.iconButton, { backgroundColor: theme.surface }]}
              accessibilityRole="button"
            >
              <Text style={[styles.closeText, { color: theme.textMuted }]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Text
        style={[
          typography.body,
          styles.body,
          { color: theme.textSecondary },
          content.type === 'thought' && [styles.thoughtBody, { fontFamily: fonts.serif.regular, color: theme.text }],
        ]}
      >
        {content.body}
      </Text>

      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tagPill, { backgroundColor: theme.surface }]}> 
              <Text style={[typography.caption, { color: theme.textMuted }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.offscreen} pointerEvents="none">
        <ShareableContentCard ref={shareCardRef} content={content} lang={lang} />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLabel: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 15,
    lineHeight: 18,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  storyTitle: {
    fontWeight: fontWeight.medium as any,
    letterSpacing: 1.4,
  },
  tipBadge: {
    fontWeight: fontWeight.semibold as any,
    letterSpacing: 1,
  },
  body: {
    fontSize: fontSize.lg,
    lineHeight: 28,
  },
  thoughtBody: {
    fontSize: 27,
    lineHeight: 38,
    fontWeight: fontWeight.normal as any,
    textAlign: 'left',
    paddingVertical: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  tagPill: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  offscreen: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
})
