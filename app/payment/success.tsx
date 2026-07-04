import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { spacing } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function PaymentSuccessScreen() {
  const router = useRouter()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [t, setT] = useState<Translations>(getT('it'))

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }, [queryClient])

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={styles.emoji}>✨</Text>
      <Text variant="heading" style={styles.title}>
        {t.payment.successTitle}
      </Text>
      <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
        {t.payment.successSubtitle}
      </Text>
      <Button label={t.payment.successCta} onPress={() => router.replace('/(app)/profile')} />
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
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
})
