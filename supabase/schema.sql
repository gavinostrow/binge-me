-- Binge database schema for Supabase (Postgres).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create extension if not exists citext;

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext unique not null check (username ~ '^[a-z0-9_.]{3,24}$'),
  name text not null default '',
  bio text not null default '',
  avatar_url text,
  spoiler_shield boolean not null default true,
  created_at timestamptz not null default now()
);

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8))),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Friends (follows) ───────────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ─── Shows (cached from TMDB) ───────────────────────────────────────────────
create table if not exists public.titles (
  id text primary key,                      -- 'show:1396' (TMDB TV id)
  type text not null default 'show' check (type = 'show'),
  tmdb_id int not null,
  title text not null,
  year int,
  poster_path text,
  genres text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ─── Ratings ─────────────────────────────────────────────────────────────────
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id text not null references public.titles (id),
  rating numeric(3,1) not null check (rating between 0 and 10),
  review text,
  is_favorite boolean not null default false,
  watched_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, title_id)
);

create table if not exists public.season_ratings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id text not null references public.titles (id),
  season int not null check (season > 0),
  rating numeric(3,1) not null check (rating between 0 and 10),
  review text,
  rated_on date not null default current_date,
  primary key (user_id, title_id, season)
);

-- App-wide ("Binge") rating per title. Only shown in the app once count >= 10.
create or replace view public.title_stats as
  select title_id, round(avg(rating), 1) as avg_rating, count(*) as rating_count
  from public.ratings group by title_id;

-- ─── Watchlist & Currently Watching ──────────────────────────────────────────
create table if not exists public.watchlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id text not null references public.titles (id),
  recommended_by uuid references public.profiles (id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

create table if not exists public.currently_watching (
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id text not null references public.titles (id),
  season int not null default 1,
  started_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

create table if not exists public.streaming_services (
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider_key text not null,               -- 'netflix', 'max', 'hulu', ...
  primary key (user_id, provider_key)
);

-- ─── "Looking for something to watch" + recommendations ─────────────────────
create table if not exists public.rec_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours'
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  title_id text not null references public.titles (id),
  request_id uuid references public.rec_requests (id) on delete set null,
  note text,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  type text not null,  -- recommendation | rec_request | follow | return_date | started_watching | prediction | reaction | comment
  title_id text references public.titles (id),
  payload jsonb not null default '{}',
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Predictions ─────────────────────────────────────────────────────────────
create table if not exists public.prediction_questions (
  id uuid primary key default gen_random_uuid(),
  title_id text not null references public.titles (id),
  season int not null,
  episode_label text,
  question text not null,
  options jsonb not null,                   -- [{ "id": "a", "label": "..." }]
  locks_at timestamptz not null,
  answer text,                              -- option id once revealed
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.prediction_picks (
  question_id uuid not null references public.prediction_questions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

-- ─── Row level security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.titles enable row level security;
alter table public.ratings enable row level security;
alter table public.season_ratings enable row level security;
alter table public.watchlist enable row level security;
alter table public.currently_watching enable row level security;
alter table public.streaming_services enable row level security;
alter table public.rec_requests enable row level security;
alter table public.recommendations enable row level security;
alter table public.notifications enable row level security;
alter table public.prediction_questions enable row level security;
alter table public.prediction_picks enable row level security;

-- Signed-in users can see social data; everyone can only change their own rows.
create policy "read profiles" on public.profiles for select to authenticated using (true);
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid());

create policy "read follows" on public.follows for select to authenticated using (true);
create policy "follow" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "unfollow" on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy "read titles" on public.titles for select to authenticated using (true);
create policy "add titles" on public.titles for insert to authenticated with check (true);
create policy "refresh titles" on public.titles for update to authenticated using (true);

do $$
declare t text;
begin
  foreach t in array array['ratings', 'season_ratings', 'watchlist', 'currently_watching', 'streaming_services', 'rec_requests'] loop
    execute format('create policy "read %1$s" on public.%1$s for select to authenticated using (true)', t);
    execute format('create policy "insert own %1$s" on public.%1$s for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "update own %1$s" on public.%1$s for update to authenticated using (user_id = auth.uid())', t);
    execute format('create policy "delete own %1$s" on public.%1$s for delete to authenticated using (user_id = auth.uid())', t);
  end loop;
end $$;

create policy "read my recs" on public.recommendations for select to authenticated
  using (to_user = auth.uid() or from_user = auth.uid());
create policy "send recs" on public.recommendations for insert to authenticated with check (from_user = auth.uid());
create policy "mark recs seen" on public.recommendations for update to authenticated using (to_user = auth.uid());

create policy "read my notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notify others" on public.notifications for insert to authenticated with check (actor_id = auth.uid());
create policy "mark notifications seen" on public.notifications for update to authenticated using (user_id = auth.uid());

create policy "read questions" on public.prediction_questions for select to authenticated using (true);
create policy "create questions" on public.prediction_questions for insert to authenticated with check (created_by = auth.uid());

-- Picks stay hidden from others until the question locks (no copying answers).
create policy "read picks after lock" on public.prediction_picks for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.prediction_questions q where q.id = question_id and q.locks_at <= now())
);
create policy "make picks before lock" on public.prediction_picks for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.prediction_questions q where q.id = question_id and q.locks_at > now())
);
create policy "change picks before lock" on public.prediction_picks for update to authenticated using (
  user_id = auth.uid()
  and exists (select 1 from public.prediction_questions q where q.id = question_id and q.locks_at > now())
);

-- Helpful indexes
create index if not exists ratings_user_idx on public.ratings (user_id, watched_on desc);
create index if not exists ratings_title_idx on public.ratings (title_id);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists recs_to_idx on public.recommendations (to_user, created_at desc);
