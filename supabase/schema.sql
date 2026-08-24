-- =========================================================
-- Takween (تكوين) — Database Schema
-- Run this in Supabase: Dashboard > SQL Editor > New query
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUM-like check constraints (kept as text for simplicity
-- and easy future extension without migrations).
-- ---------------------------------------------------------

-- ---------------------------------------------------------
-- 1. profiles
--    One row per auth.users row. Created automatically by
--    the handle_new_user trigger below.
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  major text default '',
  university text default '',
  bio text default '',
  avatar_url text,
  contact_method text default '', -- shown only after a join request is accepted
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 2. skills
--    Shared, de-duplicated skill tags (e.g. "React", "UI/UX").
-- ---------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

alter table public.skills enable row level security;

create policy "Skills are publicly readable"
  on public.skills for select
  using (true);

create policy "Authenticated users can add new skills"
  on public.skills for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------
-- 3. listings
--    A single "opportunity": either looking_for = 'members'
--    (project owner needs teammates) or 'team' (someone is
--    looking to join a team).
-- ---------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  type text not null check (type in ('hackathon','university_project','personal_project','startup','other')),
  looking_for text not null check (looking_for in ('members','team')),
  description text not null default '',
  members_needed int not null default 1 check (members_needed >= 1),
  deadline date,
  mode text not null check (mode in ('online','in_person')),
  location text,
  external_link text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_type_idx on public.listings (type);
create index if not exists listings_mode_idx on public.listings (mode);
create index if not exists listings_owner_idx on public.listings (owner_id);

alter table public.listings enable row level security;

create policy "Listings are publicly readable"
  on public.listings for select
  using (true);

create policy "Owners can insert their own listings"
  on public.listings for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on public.listings for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------
-- 4. listing_skills
--    kind = 'required' -> skills the listing is looking for
--    kind = 'owned'    -> skills the listing owner already brings
-- ---------------------------------------------------------
create table if not exists public.listing_skills (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  kind text not null check (kind in ('required','owned')),
  unique (listing_id, skill_id, kind)
);

create index if not exists listing_skills_listing_idx on public.listing_skills (listing_id);
create index if not exists listing_skills_skill_idx on public.listing_skills (skill_id);

alter table public.listing_skills enable row level security;

create policy "Listing skills are publicly readable"
  on public.listing_skills for select
  using (true);

create policy "Owners manage skills on their own listings"
  on public.listing_skills for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- 5. join_requests
--    An applicant asking to join a listing's project/team.
-- ---------------------------------------------------------
create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique (listing_id, applicant_id)
);

create index if not exists join_requests_listing_idx on public.join_requests (listing_id);
create index if not exists join_requests_applicant_idx on public.join_requests (applicant_id);

alter table public.join_requests enable row level security;

-- Applicant sees their own requests; listing owner sees requests on their listings
create policy "Read own sent or received join requests"
  on public.join_requests for select
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Authenticated users can send join requests"
  on public.join_requests for insert
  to authenticated
  with check (
    auth.uid() = applicant_id
    and not exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- Only the listing owner can accept/reject; applicant can withdraw (delete)
create policy "Owners update request status"
  on public.join_requests for update
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Applicants can withdraw their own request"
  on public.join_requests for delete
  using (auth.uid() = applicant_id);

-- ---------------------------------------------------------
-- Seed a small starter set of common skills (optional)
-- ---------------------------------------------------------
insert into public.skills (name) values
  ('React'), ('Next.js'), ('TypeScript'), ('JavaScript'), ('Python'),
  ('UI/UX Design'), ('Figma'), ('Product Management'), ('Data Analysis'),
  ('Machine Learning'), ('Flutter'), ('Node.js'), ('Backend Development'),
  ('Mobile Development'), ('Marketing'), ('Business Development'),
  ('Video Editing'), ('Content Writing'), ('Cloud/DevOps'), ('SQL/Databases')
on conflict (name) do nothing;
