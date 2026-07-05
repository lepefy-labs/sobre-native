import { forwardRef } from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { gradient, fonts } from '@/constants/theme'
import { getT } from '@/lib/i18n'
import type { ContentLang, ContentType } from '@/types/database'

export const SHARE_CARD_WIDTH = 1080
export const SHARE_CARD_HEIGHT = 1920

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

/**
 * Dedicated, non-interactive card rendered offscreen and captured as a
 * 1080x1920 (9:16) image for sharing to Instagram Stories and similar.
 * Never mounted visibly — see ContentCard's offscreen capture target.
 */
export const ShareableContentCard = forwardRef<View, ShareableContentCardProps>(function ShareableContentCard(
  { content, lang = 'it' },
  ref
) {
  const t = getT(lang)
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const palette = gradient[isDark ? 'dark' : 'light']
  const backgroundGradient = palette.byContentType[content.type]

  const textColor = isDark ? '#f5f2ec' : '#292524'
  const brandColor = isDark ? '#ffffff' : '#a8a29e'
  const bodyFontSize = adaptiveFontSize(content.body.length)

  return (
    <View ref={ref} collapsable={false} style={styles.frame}>
      <LinearGradient colors={backgroundGradient} style={StyleSheet.absoluteFill} />

      <View style={styles.body}>
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
          {content.body}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.wordmark, { fontFamily: fonts.serif.regular, color: brandColor }]}>Sobre</Text>
        <Text style={[styles.payoff, { color: brandColor }]}>{t.dashboard.home.footerPayoff}</Text>
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
    opacity: 0.85,
  },
})
