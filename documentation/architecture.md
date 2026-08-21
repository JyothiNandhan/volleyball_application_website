# Architecture

The app uses Expo Router for file-based navigation, React Native Paper for a single coherent UI system, Zustand for client state, Supabase for authentication and persistence, Zod for validation, and Expo Print/Sharing for cross-platform PDF generation.

Important layers:

- `src/services`: Supabase client and typed data access.
- `src/stores`: Auth, player, and team workflow state.
- `src/algorithms`: Position-aware balancing and balance metrics.
- `src/components`: Reusable UI primitives and product components.
- `src/pdf`: HTML-to-PDF generation and native share flow.
- `supabase/migrations`: PostgreSQL schema and row-level security.

The team generator is deterministic per seed but uses multiple seeded restarts, so regeneration can produce a different high-quality assignment while preserving quality.
