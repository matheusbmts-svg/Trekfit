-- TrekFit: schema opcional para sincronização em nuvem.
-- Execute no SQL Editor do Supabase quando quiser migrar do armazenamento local.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null,
  title text not null,
  session_date date not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  lumbar_pain_before int check (lumbar_pain_before between 0 and 10),
  radiating_pain boolean default false,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists trekking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  distance_km numeric not null,
  duration_min int not null,
  elevation_m int default 0,
  backpack_kg numeric default 0,
  lumbar_pain int check (lumbar_pain between 0 and 10),
  knee_pain int check (knee_pain between 0 and 10),
  effort int check (effort between 0 and 10),
  created_at timestamptz default now()
);

create table if not exists body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measure_date date not null,
  weight_kg numeric not null,
  waist_cm numeric,
  hip_cm numeric,
  thigh_cm numeric,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table workout_sessions enable row level security;
alter table trekking_sessions enable row level security;
alter table body_measurements enable row level security;

create policy "profiles own rows" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "workouts own rows" on workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "treks own rows" on trekking_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "measurements own rows" on body_measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
