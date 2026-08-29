# PROJECT_CONTEXT.md

## Overview
Repository: `lepefy-labs/sobre-native`
Primary branch: `main`
Mobile version: `1.0.0`

Sobre Native is the React Native replacement for the previous Capacitor frontend.
The existing backend is reused rather than duplicated.

Baseline inspected before this foundation update:
- latest `main` commit: `c5f80b51448bf66d96a4c97b32bd0db7f4303021`
- commit date: 5 July 2026
- corresponding Android Build workflow: successful release AAB

## Current stack
- Expo SDK 51
- React Native 0.74
- React 18.2
- Expo Router 3
- TypeScript
- TanStack React Query
- Supabase JS
- Expo Notifications
- Expo Secure Store
- Expo Web Browser / Auth Session
- NativeWind 4
- Reanimated / Gesture Handler

## Routes
Authentication:
- `app/(auth)/lang.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/verify.tsx`

Onboarding:
- `app/(onboarding)/index.tsx`

Authenticated app:
- `app/(app)/home.tsx`
- `app/(app)/archive.tsx`
- `app/(app)/profile.tsx`

Payment returns:
- `app/payment/success.tsx`
- `app/payment/cancel.tsx`

Startup routing resolves language, session, onboarding completion, then home.

## Implemented product capabilities

### Home
- morning/evening slot derived from user timezone
- current mood lookup
- personalized content via `get_today_content`
- active-content fallback
- IT/FR
- mood save/update
- content refresh after mood change

### Archive
- delivered notification history joined with sent content
- matching mood by date/slot
- 14-day pagination windows
- six-month client history limit
- content-type and mood filters
- grouping by date
- detail modal

### Profile
- name
- IT/FR
- system/light/dark theme
- morning/evening notification toggles
- notification time configuration
- Free/Pro status
- Stripe upgrade
- Stripe customer portal
- privacy/terms
- logout

Known gap: notification time picker is Android-only in current source.

## Backend contracts

Tables used directly:
- `profiles`
- `moods`
- `contents`
- `notifications`

RPC:
- `get_today_content`

Edge Functions:
- `create-checkout`
- `create-portal-session`

The authoritative DB schema/RLS/backend code is not stored in this repo, so backend contract
changes must be verified at the backend source before implementation.

## Notifications
`lib/notifications.ts` requests permission, creates the Android channel, obtains an Expo
Push Token and saves it in `profiles.onesignal_player_id`.

This appears to be legacy naming from a previous OneSignal architecture. Audit the full
sender/token flow before renaming or migrating it.

Recommended target: dedicated multi-device token storage with provider, platform,
lifecycle/revocation and deep-link metadata.

## Payments
Stripe checkout and customer portal are backend-owned via Supabase functions.
Mobile return URLs use the `sobre://` scheme.
Subscription truth must remain backend-owned.

## Native configuration
- scheme: `sobre`
- iOS bundle ID: `com.lepefylabs.sobre`
- Android package: `com.lepefylabs.sobre`
- current Android compile/target SDK override: 35

Current Android CI:
- Node 20
- `npm ci`
- Expo prebuild
- signing keystore restoration
- GitHub run number -> Android versionCode
- release AAB build
- artifact upload

## CI gaps
- TypeScript check was not part of the existing release workflow
- automated tests are not established
- `lint` exists in package scripts, but a verified ESLint setup was not found

Foundation Phase 1 adds TypeScript checking before native build.

## Modernization target
As of August 2026 Expo SDK 57 is current and requires:
- React Native 0.86
- React 19.2.x
- Node 22.13+ minimum
- Android compile/target SDK 36

Do not manually change only package versions. Target procedure:
1. move CI/runtime to Node 22.13+
2. install SDK 57
3. `npx expo install --fix`
4. `npx expo-doctor`
5. review SDK 51→57 changes
6. regenerate native projects
7. update lockfile
8. typecheck
9. release build
10. smoke-test auth/onboarding/mood/home/archive/push/Stripe
11. bring iOS to parity

## Roadmap
### Phase 1 — Foundation
- `AGENTS.md`
- this context
- fix obsolete context reference
- TypeScript CI gate

### Phase 2 — Expo modernization
- SDK 51 → 57
- Node 22.13+
- Android API 36
- dependency alignment and lockfile
- Expo Doctor clean
- Android AAB

### Phase 3 — Backend/mobile audit
- auth lifecycle
- RLS
- content RPC
- push sender/token compatibility
- Stripe checkout/portal
- deep-link returns

### Phase 4 — Reliability
- unit tests for timezone/slot/date logic
- integration tests for data hooks
- critical E2E paths
- error/offline/session-expiry states

### Phase 5 — iOS parity
- time picker
- push
- deep links
- payments
- build/TestFlight pipeline

### Phase 6 — Store readiness
- privacy/data disclosures
- metadata/screenshots
- signing/closed testing
- crash/analytics monitoring
- Play Store/App Store release checklist
