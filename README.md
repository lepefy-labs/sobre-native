# sobre-native

React Native (Expo bare workflow) app for Sobre — pivot from Capacitor.

## Stack

- Expo SDK 51 (bare workflow, no Expo Go)
- Expo Router v3 (file-based routing)
- TypeScript strict
- @tanstack/react-query
- @supabase/supabase-js
- expo-web-browser + expo-auth-session (magic link / Google OAuth)
- expo-notifications
- AsyncStorage + expo-secure-store
- NativeWind v4

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. `npx expo prebuild`
4. `npm run ios` / `npm run android`

Backend (Supabase, Railway, Vercel, Stripe, Resend) is unchanged — only the mobile frontend is new.
