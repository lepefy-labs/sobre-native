import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { signInWithOtp, signInWithGoogle } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, typography, fonts, gradient } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function LoginScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [t, setT] = useState<Translations>(getT('it'))
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  async function handleOtp() {
    setError(null)
    setLoading(true)
    const { error } = await signInWithOtp(email.trim())
    setLoading(false)
    if (error) {
      setError(t.auth.login.errorGeneric)
      return
    }
    router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } })
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    setGoogleLoading(false)
    if (error) setError(t.auth.login.errorGeneric)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <LinearGradient colors={gradient[theme.scheme].morning} style={StyleSheet.absoluteFill} />
      <View style={styles.brandWrap}>
        <Text style={[styles.brand, { color: theme.textMuted }]}>SOBRE</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}> 
        <Text style={[typography.display, styles.title, { fontFamily: fonts.serif.light, color: theme.text }]}>
          {t.auth.login.title}
        </Text>
        <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
          {t.auth.login.subtitle}
        </Text>

        <Text variant="label" style={styles.label}>
          {t.auth.login.emailLabel}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t.auth.login.emailPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
        />

        {error && (
          <Text variant="caption" color={theme.danger} style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Button
          label={loading ? t.auth.login.buttonLoading : t.auth.login.buttonCta}
          onPress={handleOtp}
          loading={loading}
          disabled={!email.trim()}
        />

        <Text variant="caption" color={theme.textFaint} style={styles.noPassword}>
          {t.auth.login.noPassword}
        </Text>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text variant="caption" color={theme.textFaint} style={styles.dividerText}>
            {t.auth.login.orDivider}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Button
          label={t.auth.login.googleCta}
          onPress={handleGoogle}
          loading={googleLoading}
          variant="secondary"
        />
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
  },
  noPassword: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
})
