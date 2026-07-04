import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { signInWithOtp, verifyOtp } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { spacing, fontSize } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function VerifyScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [t, setT] = useState<Translations>(getT('it'))
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  useEffect(() => {
    if (!resent) return
    const timeout = setTimeout(() => setResent(false), 3000)
    return () => clearTimeout(timeout)
  }, [resent])

  async function handleVerify() {
    setError(null)
    setLoading(true)
    const { error } = await verifyOtp(email, code)
    setLoading(false)
    if (error) {
      setError(t.auth.verify.errorInvalid)
      return
    }
    // onAuthStateChange in useAuth gestisce il redirect automaticamente
  }

  async function handleResend() {
    setError(null)
    await signInWithOtp(email)
    setResent(true)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text variant="heading" style={styles.title}>
        {t.auth.verify.title}
      </Text>
      <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
        {t.auth.verify.subtitle}{' '}
        <Text variant="body" style={{ fontWeight: '600', color: theme.text }}>
          {email}
        </Text>
      </Text>

      <TextInput
        value={code}
        onChangeText={(value) => setCode(value.replace(/[^0-9]/g, '').slice(0, 6))}
        placeholder={t.auth.verify.codePlaceholder}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        textAlign="center"
        style={[styles.codeInput, { fontSize: fontSize.xxxl }]}
      />

      {error && (
        <Text variant="caption" color={theme.danger} style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <Button
        label={loading ? t.auth.verify.buttonLoading : t.auth.verify.buttonCta}
        onPress={handleVerify}
        loading={loading}
        disabled={code.length < 6}
      />

      <Button
        label={resent ? t.auth.verify.resendConfirm : t.auth.verify.resend}
        onPress={handleResend}
        variant="ghost"
        disabled={resent}
      />

      <Button
        label={t.auth.verify.changeEmail}
        onPress={() => router.replace('/(auth)/login')}
        variant="ghost"
      />
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  codeInput: {
    width: '100%',
    marginBottom: spacing.md,
    letterSpacing: 12,
    fontWeight: '600',
  },
  error: {
    marginBottom: spacing.md,
  },
})
