import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { colors, spacing } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function VerifyScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [t, setT] = useState<Translations>(getT('it'))

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.title}>
        {t.auth.login.checkEmailTitle}
      </Text>
      <Text variant="body" color={colors.stone500} style={styles.body}>
        {t.auth.login.checkEmailBody}
        <Text variant="body" style={styles.email}>
          {email}
        </Text>
      </Text>
      <Text variant="caption" color={colors.stone400} style={styles.instruction}>
        {t.auth.login.checkEmailInstruction}
      </Text>

      <Button
        label={t.auth.login.checkEmailBack}
        onPress={() => router.replace('/(auth)/login')}
        variant="ghost"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  email: {
    fontWeight: '600',
    color: colors.stone800,
  },
  instruction: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
})
