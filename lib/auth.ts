import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from './supabase'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithOtp(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  return { error: error?.message ?? null }
}

export async function verifyOtp(email: string, token: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  return { error: error?.message ?? null }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectTo = AuthSession.makeRedirectUri({ path: '/(app)/home' })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  })
  if (error || !data?.url) return { error: error?.message ?? 'No auth URL returned' }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (result.type !== 'success') return { error: null }

  const { url } = result
  const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '')
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (access_token && refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
    return { error: sessionError?.message ?? null }
  }
  return { error: 'Missing tokens in OAuth redirect' }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
