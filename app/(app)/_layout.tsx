import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
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

  const lang: ContentLang = profile?.lang ?? storedLang ?? 'it'
  const t = getT(lang)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textFaint,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 7,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingTop: 5,
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.borderSubtle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.055,
          shadowRadius: 16,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.dashboard.nav.home,
          tabBarIcon: ({ color }) => <TabHomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: t.dashboard.nav.archive,
          tabBarIcon: ({ color }) => <TabArchiveIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.dashboard.nav.profile,
          tabBarIcon: ({ color }) => <TabProfileIcon color={color} size={22} />,
        }}
      />
    </Tabs>
  )
}
