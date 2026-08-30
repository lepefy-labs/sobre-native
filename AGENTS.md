# AGENTS.md

## Source of truth
Treat current `main` and the production backend contracts as the source of truth.
Read this file before modifying the repository. See `PROJECT_CONTEXT.md`.

## Delivery workflow
ChatGPT/Codex may write and push directly to GitHub when the user requests or approves implementation.
- Direct changes to `main` are allowed when the user explicitly targets or approves `main`.
- Prefer a PR when the user requests review/PR delivery.
- Do not require ZIP/manual upload when a ChatGPT/Codex GitHub write path is available.
- After a direct push, verify the resulting commit and relevant CI/build status.
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
For code changes:
1. `npm ci`
2. `npm run typecheck`
3. Android release/prebuild validation when native dependencies or app config change.

The repository currently exposes a `lint` script, but a verified ESLint setup was not found.
Do not claim lint is green until ESLint is explicitly configured and executed successfully.

## Expo / React Native upgrades
Current project: Expo SDK 57 with React 19.2.3 and React Native 0.86.3.
Keep Expo, React, React Native, Expo packages, compatible RN libraries, Node 22,
Android SDK requirements and the lockfile aligned as one coordinated stack.
Run `npx expo install --check`, `npx expo-doctor`, `npm run typecheck`, and Android prebuild/release validation after native dependency or app-config changes.

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
The app obtains an Expo push token but currently persists it in
`profiles.onesignal_player_id`. Treat this as legacy naming until the backend sender is audited.

## Platform parity
Android has an automated release AAB workflow.
iOS is not yet at release parity; notification time selection contains an Android-only path.
