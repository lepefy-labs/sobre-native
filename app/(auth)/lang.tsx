import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { setLangInStorage, getT } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, typography, fonts, gradient } from '@/constants/theme'
import type { ContentLang } from '@/types/database'

export default function LangScreen() {
  const router = useRouter()
  const theme = useTheme()
  const t = getT('it')

  async function selectLang(lang: ContentLang) {
    await setLangInStorage(lang)
    router.replace('/(auth)/login')
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <LinearGradient colors={gradient[theme.scheme].morning} style={StyleSheet.absoluteFill} />
      <View style={styles.brandWrap}>
        <Text style={[styles.brand, { color: theme.textMuted }]}>SOBRE</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}> 
        <Text style={[typography.display, styles.title, { fontFamily: fonts.serif.light, color: theme.text }]}>
          {t.lang.title}
        </Text>
        <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
          {t.lang.subtitle}
        </Text>

        <View style={styles.buttons}>
          <Button label={`🇮🇹  ${t.lang.it}`} onPress={() => selectLang('it')} variant="secondary" />
          <Button label={`🇫🇷  ${t.lang.fr}`} onPress={() => selectLang('fr')} variant="secondary" />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
})
