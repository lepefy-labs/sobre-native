import { useEffect, useRef } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { EmailOtpType } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { colors } from '@/constants/theme'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const { token_hash, type } = useLocalSearchParams<{ token_hash?: string; type?: string }>()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function handleCallback() {
      if (!token_hash || !type) {
        router.replace('/(auth)/login?error=1')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as EmailOtpType,
      })

      if (error) {
        router.replace('/(auth)/login?error=1')
        return
      }

      router.replace('/')
    }

    handleCallback()
  }, [token_hash, type, router])

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.stone800} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.stone50,
  },
})
