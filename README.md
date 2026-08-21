# Volleyball Team Manager

A production-oriented cross-platform volleyball team management app built with Expo, React Native, TypeScript, Supabase, Zustand, React Native Paper, Zod, Jest, and Expo PDF sharing.

## Features

- Supabase email/password admin login with persistent sessions.
- Protected Expo Router app routes.
- Player CRUD with position, rating stars, playing status, notes, optional photo picking, search, filters, and sorting.
- Dashboard roster summary and polished team creation dialog.
- Smart team generation with skill, average, position, and size balancing.
- Regenerate balanced teams, finalize team assignments, and export/share a professional PDF.
- Light/dark theme support through React Native Paper.
- Supabase migrations with RLS so each admin only accesses their own data.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Apply `supabase/migrations/202608200001_initial_schema.sql` in your Supabase project SQL editor or CLI.

4. Create an admin user in Supabase Auth.

## Run

```bash
npm run start
npm run ios
npm run android
```

## Validate

```bash
npm run typecheck
npm run lint
npm run test
```

## Team Balancing Algorithm

`generateBalancedTeams(players, teamCount)` creates multiple seeded candidates. Each candidate groups players by position, sorts by skill, distributes with a snake-draft pattern, fixes team sizes, then runs pairwise swap optimization.

`evaluateTeams(teams)` calculates:

- total skill difference
- average skill difference
- positional imbalance
- team size difference
- overall balance score

Lower scores are better. The app displays friendly confidence labels without claiming statistical certainty.

## Assumptions

- Email/password admins are created in Supabase Auth.
- Player photos are stored as local picked URIs in this scaffold. Production storage can add Supabase Storage without changing the player form contract.
- PDF preview/share uses the native share sheet via `expo-sharing`.
