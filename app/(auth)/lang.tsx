import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { setLangInStorage, getT } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { spacing } from '@/constants/theme'
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
      <Text variant="heading" style={styles.title}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
})
