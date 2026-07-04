import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import type { Translations } from '@/lib/i18n/types'

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{symbol}</Text>
}

export default function AppLayout() {
  const [t, setT] = useState<Translations>(getT('it'))
  const theme = useTheme()

  useEffect(() => {
    getLangFromStorage().then((lang) => setT(getT(lang ?? 'it')))
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textFaint,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderSubtle,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.dashboard.nav.home,
          tabBarIcon: ({ color }) => <TabIcon symbol="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: t.dashboard.nav.archive,
          tabBarIcon: ({ color }) => <TabIcon symbol="🗂️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.dashboard.nav.profile,
          tabBarIcon: ({ color }) => <TabIcon symbol="👤" color={color} />,
        }}
      />
    </Tabs>
  )
}
