create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  position text not null check (position in ('setter','outside_hitter','opposite','middle_blocker','libero','flexible')),
  rating integer not null check (rating between 1 and 5),
  is_playing boolean not null default true,
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_generations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team_count integer not null check (team_count > 0),
  player_count integer not null check (player_count >= 0),
  balance_score numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.team_generations(id) on delete cascade,
  team_number integer not null,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  rating_at_generation integer not null check (rating_at_generation between 1 and 5),
  position_at_generation text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.team_generations enable row level security;
alter table public.teams enable row level security;
alter table public.team_players enable row level security;

create policy "profiles owner select" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles owner update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "players owner select" on public.players for select using (auth.uid() = owner_id);
create policy "players owner insert" on public.players for insert with check (auth.uid() = owner_id);
create policy "players owner update" on public.players for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "players owner delete" on public.players for delete using (auth.uid() = owner_id);

create policy "generations owner select" on public.team_generations for select using (auth.uid() = owner_id);
create policy "generations owner insert" on public.team_generations for insert with check (auth.uid() = owner_id);
create policy "generations owner delete" on public.team_generations for delete using (auth.uid() = owner_id);

create policy "teams owner select" on public.teams for select using (
  exists (
    select 1 from public.team_generations g
    where g.id = teams.generation_id and g.owner_id = auth.uid()
  )
);
create policy "teams owner insert" on public.teams for insert with check (
  exists (
    select 1 from public.team_generations g
    where g.id = teams.generation_id and g.owner_id = auth.uid()
  )
);

create policy "team players owner select" on public.team_players for select using (
  exists (
    select 1 from public.teams t
    join public.team_generations g on g.id = t.generation_id
    where t.id = team_players.team_id and g.owner_id = auth.uid()
  )
);
create policy "team players owner insert" on public.team_players for insert with check (
  exists (
    select 1 from public.teams t
    join public.team_generations g on g.id = t.generation_id
    where t.id = team_players.team_id and g.owner_id = auth.uid()
  )
);

create index if not exists players_owner_id_idx on public.players(owner_id);
create index if not exists team_generations_owner_id_idx on public.team_generations(owner_id);
create index if not exists teams_generation_id_idx on public.teams(generation_id);
create index if not exists team_players_team_id_idx on public.team_players(team_id);
