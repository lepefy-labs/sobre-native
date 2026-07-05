import '../global.css'
import { createContext, useContext } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Fraunces_300Light, Fraunces_400Regular } from '@expo-google-fonts/fraunces'
import { useAuth } from '@/hooks/useAuth'
import type { Session, User } from '@supabase/supabase-js'

const queryClient = new QueryClient()

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, session: null, loading: true })

export function useAuthContext() {
  return useContext(AuthContext)
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_300Light, Fraunces_400Regular })

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
