import { useEffect, useRef } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { EmailOtpType } from '@supabase/supabase-js'
import * as Haptics from 'expo-haptics'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { token_hash, type } = useLocalSearchParams<{ token_hash?: string; type?: string }>()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function handleCallback() {
      if (!token_hash || !type) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        router.replace('/(auth)/login?error=1')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as EmailOtpType,
      })

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        router.replace('/(auth)/login?error=1')
        return
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace('/')
    }

    handleCallback()
  }, [token_hash, type, router])

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ActivityIndicator color={theme.text} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
