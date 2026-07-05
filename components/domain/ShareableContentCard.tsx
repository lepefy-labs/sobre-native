import { forwardRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { gradient, fonts, lightColors } from '@/constants/theme'
import { getT } from '@/lib/i18n'
import type { ContentLang, ContentType } from '@/types/database'

export const SHARE_CARD_WIDTH = 1080
export const SHARE_CARD_HEIGHT = 1920

const BODY_TRUNCATE_LIMIT = 280

type ShareableContentCardProps = {
  content: {
    type: ContentType
    title: string | null
    body: string
  }
  lang?: ContentLang
}

function adaptiveFontSize(length: number): number {
  if (length <= 60) return 88
  if (length <= 120) return 72
  if (length <= 220) return 56
  return 44
}

function truncateBody(body: string): string {
  if (body.length <= BODY_TRUNCATE_LIMIT) return body
  const sliced = body.slice(0, BODY_TRUNCATE_LIMIT)
  const lastSpace = sliced.lastIndexOf(' ')
  const boundary = lastSpace > 0 ? lastSpace : BODY_TRUNCATE_LIMIT
  return `${sliced.slice(0, boundary).trimEnd()}…`
}

/**
 * Dedicated, non-interactive card rendered offscreen and captured as a
 * 1080x1920 (9:16) image for sharing to Instagram Stories and similar.
 * Never mounted visibly — see ContentCard's offscreen capture target.
 * Always renders in light mode: it's a fixed brand asset, not a themed
 * app surface, so it must look the same regardless of the sharer's device theme.
 */
export const ShareableContentCard = forwardRef<View, ShareableContentCardProps>(function ShareableContentCard(
  { content, lang = 'it' },
  ref
) {
  const t = getT(lang)
  const backgroundGradient = gradient.light.byContentType[content.type]

  const textColor = lightColors.text
  const truncatedBody = truncateBody(content.body)
  const bodyFontSize = adaptiveFontSize(truncatedBody.length)

  const eyebrowText =
    content.type === 'story' && content.title
      ? content.title.toUpperCase()
      : content.type === 'tip'
        ? t.dashboard.content.tipLabel.toUpperCase()
        : null

  return (
    <View ref={ref} collapsable={false} style={styles.frame}>
      <LinearGradient colors={backgroundGradient} style={StyleSheet.absoluteFill} />

      <View style={styles.body}>
        {eyebrowText && (
          <Text style={[styles.eyebrow, { fontFamily: fonts.serif.regular, color: lightColors.accent }]}>
            {eyebrowText}
          </Text>
        )}

        <Text
          style={[
            styles.bodyText,
            {
              fontFamily: fonts.serif.light,
              fontSize: bodyFontSize,
              lineHeight: bodyFontSize * 1.35,
              color: textColor,
            },
          ]}
        >
          {truncatedBody}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.wordmark, { fontFamily: fonts.serif.regular, color: lightColors.textSecondary }]}>
          Sobre
        </Text>
        <Text style={[styles.payoff, { color: lightColors.textFaint }]}>{t.dashboard.home.footerPayoff}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  frame: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 96,
  },
  eyebrow: {
    fontSize: 26,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 24,
  },
  bodyText: {
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 30,
    letterSpacing: 3,
  },
  payoff: {
    fontSize: 22,
    marginTop: 8,
  },
})
