import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { lightColors, darkColors, type ThemeColors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import type { ThemePreference } from '@/types/database'

type ResolvedScheme = 'light' | 'dark'

type ThemeContextValue = ThemeColors & {
  scheme: ResolvedScheme
  themePreference: ThemePreference
  setThemePreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  // Optimistic override so the toggle feels instant; cleared once the
  // refetched profile confirms the same value the user picked.
  const [optimisticPreference, setOptimisticPreference] = useState<ThemePreference | null>(null)

  const themePreference: ThemePreference = optimisticPreference ?? profile?.theme_preference ?? 'system'

  useEffect(() => {
    if (optimisticPreference && profile?.theme_preference === optimisticPreference) {
      setOptimisticPreference(null)
    }
  }, [profile?.theme_preference, optimisticPreference])

  const scheme: ResolvedScheme =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference

  async function setThemePreference(preference: ThemePreference) {
    if (!user) return
    setOptimisticPreference(preference)
    await supabase.from('profiles').update({ theme_preference: preference }).eq('id', user.id)
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  const value = useMemo<ThemeContextValue>(() => {
    const colors = scheme === 'dark' ? darkColors : lightColors
    return { ...colors, scheme, themePreference, setThemePreference }
  }, [scheme, themePreference, user])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
