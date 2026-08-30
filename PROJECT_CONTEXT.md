# PROJECT_CONTEXT.md

## Overview
Repository: `lepefy-labs/sobre-native`
Primary branch: `main`
Mobile version: `1.0.0`

Sobre Native is the React Native replacement for the previous Capacitor frontend. The existing Supabase/Stripe/content backend is reused rather than duplicated.

## Current validated baseline
As of 30 August 2026:
- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- TypeScript 6.0.x
- Expo Router 57
- Node 22.13.1 in CI
- Android compile/target SDK 36
- Android min SDK 24 (Android 7+)
- Android release Build #55 succeeded and uploaded the final signed AAB after the primary UI/UX redesign

The temporary Expo-upgrade workflow has been removed.

CI is deliberately split:
- `.github/workflows/ci.yml` runs automatically on `main`/PR: `npm ci`, reliability tests and typecheck;
- `.github/workflows/android-build.yml` is manual (`workflow_dispatch`) for ordinary use and also accepts the explicit `.release/android-final` marker path for a deliberate final release build.

This prevents an AAB build from running for every UI or application-code commit.

## Play device compatibility baseline
The published Expo 57 build shows fewer supported devices than the previous Expo 51 release. This is expected primarily because:
- Expo SDK 51 supported Android 6+;
- Expo SDK 57 supports Android 7+;
- the final AAB declares `minSdkVersion=24`, `targetSdkVersion=36`;
- the AAB contains `arm64-v8a`, `armeabi-v7a`, `x86`, and `x86_64` native libraries;
- inspection of the final base manifest found no mandatory `uses-feature` hardware declaration that would accidentally require camera, GPS, NFC, telephony, or similar hardware.

Google Play reported approximately 1,038 fewer supported phone models, 152 fewer tablets, and one fewer TV model compared with the previous release. Treat these warnings as an expected SDK support-floor change unless Play's device-catalog detail shows a different exclusion reason.

Do not force `minSdkVersion` back to API 23 solely to recover Android 6 devices: that would put the project outside the supported Expo SDK 57 / React Native 0.86 platform baseline.

## Current stack
- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- Expo Router 57
- TypeScript 6
- TanStack React Query
- Supabase JS
- Expo Notifications
- Expo Secure Store
- Expo Web Browser / Auth Session
- NativeWind 4
- Reanimated 4 + React Native Worklets

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

Known platform gap: onboarding exposes an iOS time picker, while profile notification-time editing still only invokes the Android picker path.

## UI/UX baseline — redesigned August 2026
The primary product flow has been visually redesigned without changing business semantics.

Design direction:
- warm stone + amber palette;
- Fraunces reserved for editorial/display moments;
- larger radii and calmer surfaces;
- stronger hierarchy between primary content and secondary metadata;
- reduced admin/form-like appearance;
- coherent light/dark treatment.

Updated surfaces:
- language selection;
- login;
- OTP verification;
- onboarding;
- bottom navigation shell;
- home;
- daily content card;
- mood check-in;
- archive filters/list/detail entry points;
- profile/settings/subscription surfaces.

The redesign intentionally preserves existing routes, Supabase reads/writes, Stripe calls and product copy.

## Backend source of truth
The backend contracts are implemented primarily in:
- `lepefy-labs/sobre-app` — Supabase migrations/functions + legacy web/Capacitor app
- `lepefy-labs/sobre-batch` — Railway content generation and notification sender

Tables used by native:
- `profiles`
- `moods`
- `contents`
- `notifications`

RPC:
- `get_today_content`

Edge Functions:
- `create-checkout`
- `create-portal-session`

Always inspect those authoritative repos before changing backend contracts.

## Foundation audit findings
Detailed report: `docs/FOUNDATION_AUDIT.md`.

### Authentication
Sensitive OTP/session debug logging was removed from `lib/auth.ts`. No authentication semantics changed.

### Push — production blocker
Native currently obtains an Expo Push Token and writes it into `profiles.onesignal_player_id`.

Production `sobre-batch/notify.js` is still a OneSignal sender using `include_player_ids`. Expo Push Tokens and OneSignal player/subscription IDs are incompatible.

Do not rename fields or switch provider without explicit architecture approval. Push is not production-ready until one coherent provider/storage path is chosen.

### Supabase hardening findings
The legacy schema has RLS enabled and owner-scoped policies, but:
- `get_today_content` is `SECURITY DEFINER` and accepts `p_user_id` without an explicit `auth.uid()` check;
- the notifications update policy is row-scoped but does not technically restrict changes to `opened_at` only.

These require a dedicated backend migration in `sobre-app`; none was applied during the native foundation pass.

### Stripe hardening findings
Checkout/portal authenticate the bearer token and scope customer lookup to the authenticated user. A later backend pass should allowlist plan and redirect/return URLs and harden malformed Authorization handling. Payment semantics were not changed.

## Reliability baseline
`lib/domain/time.ts` contains pure timezone/archive date logic.

`tests/time.test.mjs` covers:
- timezone-sensitive slot selection;
- 05:00/18:00 slot boundaries;
- timezone date boundaries;
- leap-year/month-end subtraction;
- archive initial windows;
- six-month pagination cutoff.

An archive date bug caused by `Date.setUTCMonth()` rollover was fixed using calendar-safe month subtraction.

Automatic CI now runs:
1. `npm ci`
2. `npm test`
3. `npm run typecheck`

Manual Android release validation runs:
1. the same install/test/typecheck gates;
2. Android native setup/prebuild;
3. signed `bundleRelease`;
4. AAB upload.

Automated integration/E2E coverage is still limited. After the UI/UX pass, expand coverage to data hooks and auth → onboarding/session restore → mood → home.

## Native configuration
- scheme: `sobre`
- iOS bundle ID: `com.lepefylabs.sobre`
- Android package: `com.lepefylabs.sobre`
- Android min SDK: 24
- Android compile/target SDK: 36
- CI Node: 22.13.1

## Current roadmap
### Completed — Foundation + Expo modernization
- repository operating rules/context
- SDK 51 → 57
- React/RN dependency alignment
- clean lockfile
- Node 22
- Android API 36
- Expo prebuild
- signed release AAB
- foundation/backend audit
- first reliability unit tests
- lightweight automatic CI / manual Android AAB split

### Completed — Primary UI/UX redesign
- auth entry screens
- onboarding
- navigation shell
- home/content/mood
- archive
- profile/settings
- final Android release Build #55

### Next — Critical backend/platform closure
- choose OneSignal-native vs Expo Push architecture and implement end-to-end
- harden `get_today_content` and notifications update policy
- Stripe redirect allowlisting / request validation
- iOS parity: profile time picker, push, deep links, payments, TestFlight build

### Store readiness
- real-device visual smoke tests
- privacy/data disclosures
- metadata/screenshots
- closed testing
- crash/analytics monitoring
- Play Store/App Store release checklist
