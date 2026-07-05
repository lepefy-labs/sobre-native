import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { getT, getLangFromStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { useProfile } from '@/hooks/useProfile'
import { TabHomeIcon, TabArchiveIcon, TabProfileIcon } from '@/components/ui/icons'
import type { ContentLang } from '@/types/database'

export default function AppLayout() {
  const [storedLang, setStoredLang] = useState<ContentLang | null>(null)
  const { data: profile } = useProfile()
  const theme = useTheme()

  useEffect(() => {
    getLangFromStorage().then(setStoredLang)
  }, [])

  // profile.lang (Supabase) is the single source of truth once authenticated;
  // AsyncStorage only covers the brief window before the profile has loaded.
  const lang: ContentLang = profile?.lang ?? storedLang ?? 'it'
  const t = getT(lang)

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
