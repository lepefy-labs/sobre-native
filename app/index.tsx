import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthContext } from './_layout'
import { getLangFromStorage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { colors } from '@/constants/theme'

type Destination = '/(auth)/lang' | '/(auth)/login' | '/(onboarding)' | '/(app)/home'

export default function Index() {
  const { session, loading: authLoading } = useAuthContext()
  const [destination, setDestination] = useState<Destination | null>(null)

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function resolveDestination() {
      const lang = await getLangFromStorage()
      if (!lang) {
        if (!cancelled) setDestination('/(auth)/lang')
        return
      }

      if (!session) {
        if (!cancelled) setDestination('/(auth)/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (!cancelled) {
        setDestination(profile?.onboarding_completed ? '/(app)/home' : '/(onboarding)')
      }
    }

    resolveDestination()
    return () => {
      cancelled = true
    }
  }, [authLoading, session])

  if (!destination) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.stone50 }}>
        <ActivityIndicator color={colors.stone800} />
      </View>
    )
  }

  return <Redirect href={destination} />
}
