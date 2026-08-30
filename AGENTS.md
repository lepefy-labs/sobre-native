# AGENTS.md

## Source of truth
Treat current `main` and the production backend contracts as the source of truth.
Read this file before modifying the repository. See `PROJECT_CONTEXT.md`.

## Delivery workflow
ChatGPT/Codex may write and push directly to GitHub when the user requests or approves implementation.
- Direct changes to `main` are allowed when the user explicitly targets or approves `main`.
- Prefer a PR when the user requests review/PR delivery.
- Do not require ZIP/manual upload when a ChatGPT/Codex GitHub write path is available.
- After a direct push, verify the resulting commit and relevant CI status.
- Report touched files and any manual migration/configuration separately.

## Approval required
Require explicit approval before:
- destructive database migrations;
- changing Stripe/payment semantics;
- changing authentication semantics;
- deleting or renaming production data fields;
- replacing the push provider;
- changing production bundle/package identifiers.

## Required checks
For ordinary application/UI changes, the automatic CI gate is:
1. `npm ci`
2. `npm test`
3. `npm run typecheck`

Do NOT trigger an Android AAB for every commit.
`.github/workflows/android-build.yml` is manual and should be run only:
- at the end of a meaningful delivery block;
- before release/store delivery;
- when native dependencies, Expo plugins, `app.json`, signing or Android-native configuration change and native validation is actually required.

The repository currently exposes a `lint` script, but a verified ESLint setup was not found.
Do not claim lint is green until ESLint is explicitly configured and executed successfully.

## Expo / React Native upgrades
Current project: Expo SDK 57 with React 19.2.3 and React Native 0.86.3.
Keep Expo, React, React Native, Expo packages, compatible RN libraries, Node 22,
Android SDK requirements and the lockfile aligned as one coordinated stack.
Run `npx expo install --check`, `npx expo-doctor`, `npm test`, `npm run typecheck`, and Android prebuild/release validation after native dependency or app-config changes.

## Backend contracts currently used
Known Supabase resources:
- `profiles`
- `moods`
- `contents`
- `notifications`
- RPC `get_today_content`
- Edge Function `create-checkout`
- Edge Function `create-portal-session`

Inspect the authoritative backend before changing any of these contracts.

## Push notifications
The native app currently obtains an Expo Push Token and persists it in `profiles.onesignal_player_id`, while the production sender in `lepefy-labs/sobre-batch` still sends through OneSignal `include_player_ids`.
Treat push as a known architecture blocker. Do not silently switch provider or rename the production field.

## Platform parity
Android has a validated signed release AAB workflow, now manual by design.
iOS is not yet at release parity; profile notification-time editing still contains an Android-only picker path.
