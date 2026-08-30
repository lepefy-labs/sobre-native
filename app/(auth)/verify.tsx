import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { signInWithOtp, verifyOtp } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { spacing, fontSize, radius, typography, fonts, gradient } from '@/constants/theme'
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
    const { error, session } = await verifyOtp(email, code.trim())
    setLoading(false)
    if (error || !session) {
      setError(t.auth.verify.errorInvalid)
      return
    }
    router.replace('/')
  }

  async function handleResend() {
    setError(null)
    await signInWithOtp(email)
    setResent(true)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <LinearGradient colors={gradient[theme.scheme].morning} style={StyleSheet.absoluteFill} />
      <View style={styles.brandWrap}>
        <Text style={[styles.brand, { color: theme.textMuted }]}>SOBRE</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}> 
        <Text style={[typography.display, styles.title, { fontFamily: fonts.serif.light, color: theme.text }]}>
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

        <View style={styles.secondaryActions}>
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
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
  secondaryActions: {
    marginTop: spacing.sm,
  },
})
