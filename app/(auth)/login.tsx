import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth'
import { colors, spacing } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function LoginScreen() {
  const router = useRouter()
  const [t, setT] = useState<Translations>(getT('it'))
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  async function handleMagicLink() {
    setError(null)
    setLoading(true)
    const { error } = await signInWithMagicLink(email.trim())
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
    <View style={styles.container}>
      <Text variant="heading" style={styles.title}>
        {t.auth.login.title}
      </Text>
      <Text variant="body" color={colors.stone500} style={styles.subtitle}>
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
        <Text variant="caption" color={colors.red500} style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        label={loading ? t.auth.login.buttonLoading : t.auth.login.buttonCta}
        onPress={handleMagicLink}
        loading={loading}
        disabled={!email.trim()}
      />

      <Text variant="caption" color={colors.stone400} style={styles.noPassword}>
        {t.auth.login.noPassword}
      </Text>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text variant="caption" color={colors.stone400} style={styles.dividerText}>
          {t.auth.login.orDivider}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        label={t.auth.login.googleCta}
        onPress={handleGoogle}
        loading={googleLoading}
        variant="secondary"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone50,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xxl,
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
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.stone200,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
})
