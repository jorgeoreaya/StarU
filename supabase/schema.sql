-- ============================================================
--  StarU — Esquema de base de datos para Supabase
--  Ejecuta este archivo completo en: Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- EXTENSIONES ----------
create extension if not exists "uuid-ossp";

-- ============================================================
--  TABLA: profiles  (1:1 con auth.users)
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('inversor', 'emprendimiento')),
  full_name    text,
  email        text,
  city         text,
  avatar_url   text,
  -- Campos de emprendimiento / startup
  business_name   text,
  rubro           text,
  experience      text,
  description     text,
  pitch_video_url text,
  -- Campos de inversor
  company       text,
  investor_type text,
  interests     text[] default '{}',
  bio           text,
  created_at   timestamptz not null default now()
);

-- ============================================================
--  TABLA: products  (productos/servicios de un emprendimiento)
-- ============================================================
create table if not exists public.products (
  id         uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  price      text,
  created_at timestamptz not null default now()
);

-- ============================================================
--  TABLA: academia_posts  (contenido de Academia StarU)
-- ============================================================
create table if not exists public.academia_posts (
  id         uuid primary key default uuid_generate_v4(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  content    text not null,
  cover_url  text,
  created_at timestamptz not null default now()
);

-- ============================================================
--  TABLAS: comunidad (foros)
-- ============================================================
create table if not exists public.community_threads (
  id         uuid primary key default uuid_generate_v4(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_replies (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references public.community_threads(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
--  TABLA: convocatorias  (eventos, concursos, webinars...)
-- ============================================================
create table if not exists public.convocatorias (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid references public.profiles(id) on delete set null,
  title       text not null,
  description text,
  event_type  text,
  event_date  date,
  location    text,
  url         text,
  created_at  timestamptz not null default now()
);

-- ============================================================
--  TRIGGER: crear fila en profiles al registrarse un usuario
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'emprendimiento'),
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'city'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.products          enable row level security;
alter table public.academia_posts    enable row level security;
alter table public.community_threads enable row level security;
alter table public.community_replies enable row level security;
alter table public.convocatorias     enable row level security;

-- ---- profiles ----
drop policy if exists "perfiles visibles para todos" on public.profiles;
create policy "perfiles visibles para todos"
  on public.profiles for select using (true);

drop policy if exists "el usuario edita su propio perfil" on public.profiles;
create policy "el usuario edita su propio perfil"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "el usuario inserta su propio perfil" on public.profiles;
create policy "el usuario inserta su propio perfil"
  on public.profiles for insert with check (auth.uid() = id);

-- ---- products ----
drop policy if exists "productos visibles para todos" on public.products;
create policy "productos visibles para todos"
  on public.products for select using (true);

drop policy if exists "el dueño gestiona sus productos" on public.products;
create policy "el dueño gestiona sus productos"
  on public.products for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ---- academia_posts ----
drop policy if exists "academia visible para todos" on public.academia_posts;
create policy "academia visible para todos"
  on public.academia_posts for select using (true);

drop policy if exists "autor gestiona sus posts" on public.academia_posts;
create policy "autor gestiona sus posts"
  on public.academia_posts for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ---- community_threads ----
drop policy if exists "hilos visibles para todos" on public.community_threads;
create policy "hilos visibles para todos"
  on public.community_threads for select using (true);

drop policy if exists "usuarios crean hilos" on public.community_threads;
create policy "usuarios crean hilos"
  on public.community_threads for insert with check (auth.uid() = author_id);

drop policy if exists "autor gestiona sus hilos" on public.community_threads;
create policy "autor gestiona sus hilos"
  on public.community_threads for update using (auth.uid() = author_id);

-- ---- community_replies ----
drop policy if exists "respuestas visibles para todos" on public.community_replies;
create policy "respuestas visibles para todos"
  on public.community_replies for select using (true);

drop policy if exists "usuarios responden" on public.community_replies;
create policy "usuarios responden"
  on public.community_replies for insert with check (auth.uid() = author_id);

-- ---- convocatorias ----
drop policy if exists "convocatorias visibles para todos" on public.convocatorias;
create policy "convocatorias visibles para todos"
  on public.convocatorias for select using (true);

drop policy if exists "usuarios crean convocatorias" on public.convocatorias;
create policy "usuarios crean convocatorias"
  on public.convocatorias for insert with check (auth.uid() = author_id);

-- ============================================================
--  STORAGE BUCKETS (públicos para lectura)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('pitches', 'pitches', true), ('academia', 'academia', true)
on conflict (id) do nothing;

-- Lectura pública de los tres buckets
drop policy if exists "lectura publica de medios" on storage.objects;
create policy "lectura publica de medios"
  on storage.objects for select
  using (bucket_id in ('avatars', 'pitches', 'academia'));

-- Subida solo para usuarios autenticados
drop policy if exists "subida autenticada de medios" on storage.objects;
create policy "subida autenticada de medios"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'pitches', 'academia'));

-- Actualizar/borrar los propios archivos
drop policy if exists "gestion de medios propios" on storage.objects;
create policy "gestion de medios propios"
  on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'pitches', 'academia') and owner = auth.uid());
