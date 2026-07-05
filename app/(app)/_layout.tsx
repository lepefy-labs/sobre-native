import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { TabHomeIcon, TabArchiveIcon, TabProfileIcon } from '@/components/ui/icons'
import type { Translations } from '@/lib/i18n/types'

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
          tabBarIcon: ({ color }) => <TabHomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: t.dashboard.nav.archive,
          tabBarIcon: ({ color }) => <TabArchiveIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.dashboard.nav.profile,
          tabBarIcon: ({ color }) => <TabProfileIcon color={color} />,
        }}
      />
    </Tabs>
  )
}
