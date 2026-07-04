import { useEffect, useRef, useState } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { spacing } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'

export default function VerifyScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [t, setT] = useState<Translations>(getT('it'))
  const breathe = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [breathe])

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View
        style={[styles.mark, { borderColor: theme.accent, opacity: breathe, transform: [{ scale: breathe }] }]}
      />
      <Text variant="heading" style={styles.title}>
        {t.auth.login.checkEmailTitle}
      </Text>
      <Text variant="body" color={theme.textMuted} style={styles.body}>
        {t.auth.login.checkEmailBody}
        <Text variant="body" style={{ fontWeight: '600', color: theme.text }}>
          {email}
        </Text>
      </Text>
      <Text variant="caption" color={theme.textFaint} style={styles.instruction}>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  instruction: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
})
