# Foundation audit — 2026-08-30

## Android / Expo 57 baseline

Validated release baseline:
- Expo SDK 57
- React 19.2.3
- React Native 0.86.3
- Node 22.13.1
- Android compile/target SDK 36
- Android Build #43: release AAB built and uploaded successfully

Build-level smoke gates now cover:
- clean `npm ci`
- reliability unit tests
- TypeScript
- Expo prebuild
- signed Android `bundleRelease`
- AAB artifact upload

A real-device functional smoke pass is still required before store release for OTP/login, onboarding, mood, home, archive, theme, logout/session restore, payment returns and notifications.

## Authentication audit

Native OTP flow uses Supabase Auth and restores the returned session.

Fixed in `sobre-native`:
- removed logging of OTP values and Supabase session payloads from `verifyOtp()`.

No authentication semantics were changed.

## Push audit — BLOCKER

The current native client obtains an **Expo Push Token** and writes it to `profiles.onesignal_player_id`.

The production sender in `lepefy-labs/sobre-batch/notify.js` is still **OneSignal** and sends `onesignal_player_id` through `include_player_ids`.

An Expo Push Token is not a OneSignal player/subscription ID. The contracts are incompatible.

Do not rename the DB field or switch providers implicitly. Before production push is considered ready, choose and implement one coherent path:
1. keep OneSignal and register the native app with the OneSignal native SDK, or
2. migrate sender + token storage to Expo Push Service with a dedicated multi-device token table.

This decision is intentionally left unresolved because replacing the push provider is a critical architecture change requiring explicit approval.

## Supabase / RLS audit

Source inspected: `lepefy-labs/sobre-app/supabase/migrations/001_initial.sql`.

Positive baseline:
- RLS enabled on profiles, subscriptions, contents, moods and notifications.
- profile/mood/notification reads are scoped to the authenticated user.
- subscription reads are scoped to the authenticated user.
- content reads are restricted to authenticated users and active content.

Hardening findings:
1. `get_today_content(p_user_id, p_slot)` is `SECURITY DEFINER` and does not verify `auth.uid() = p_user_id`. Unless execute privileges are restricted elsewhere in production, an authenticated caller could potentially request another user's current content by UUID.
2. the policy named `Users can update own notifications (opened_at)` restricts rows by owner but does not restrict updated columns to `opened_at`.

These findings require a backend migration in `sobre-app`; no database migration was applied from this native-repo hardening pass.

## Stripe audit

Source inspected: `lepefy-labs/sobre-app/supabase/functions/create-checkout` and `create-portal-session`.

Positive baseline:
- both functions resolve the authenticated Supabase user from the bearer token before querying customer data.
- Stripe customer lookup is scoped to `user.id`.
- subscription truth remains backend-owned.

Hardening recommendation for a dedicated backend pass:
- validate `plan` against an explicit allowlist;
- allowlist `successUrl`, `cancelUrl` and portal `returnUrl` instead of accepting arbitrary authenticated-client URLs;
- handle missing/malformed Authorization headers explicitly rather than relying on non-null assertions.

No payment semantics were changed in this pass.

## Reliability phase implemented

Pure timezone/archive date logic moved to `lib/domain/time.ts` and covered by Node unit tests.

Covered cases:
- user timezone controls morning/evening slot;
- 05:00 and 18:00 slot boundaries;
- date calculation across UTC-day boundaries;
- month subtraction clamps correctly at February/leap-year boundaries;
- archive 14-day windows;
- archive pagination cannot pass the six-month cutoff.

The archive month calculation was corrected to avoid JavaScript `setUTCMonth()` rollover (for example, August 30 minus six months drifting into March).

Next reliability expansion after UI/UX should target data-hook integration tests and one critical end-to-end path: auth → onboarding/session restore → mood → home.
