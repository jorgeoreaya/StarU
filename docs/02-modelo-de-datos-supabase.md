# 2. Modelo de datos y Supabase

Todo el esquema vive en un solo archivo reproducible: **`supabase/schema.sql`**.
Se ejecuta completo en el Dashboard de Supabase (**SQL Editor → New query**) y
crea tablas, políticas RLS, el trigger de registro y los buckets de Storage.

> El archivo empieza habilitando la extensión `uuid-ossp`
> (`create extension if not exists "uuid-ossp";`) que se usa para los
> `uuid_generate_v4()` de las claves primarias.

---

## Tablas

### `profiles` (1:1 con `auth.users`)

Es la tabla central. Su clave primaria **es** el `id` del usuario de
autenticación: hay una relación **1:1 entre `auth.users` y `profiles`**.

```sql
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
```

Puntos clave:

- `id` referencia `auth.users(id)` con `on delete cascade`: si se borra el
  usuario de auth, su perfil desaparece automáticamente.
- `role` solo admite `'inversor'` o `'emprendimiento'` (las **startups son
  emprendimientos**, ver [doc 1](./01-vision-general-y-stack.md)).
- Una sola tabla guarda los campos de ambos roles; cada rol usa el subconjunto
  que le corresponde.

### `products`

Productos/servicios de un emprendimiento. FK a `profiles` con cascade.

```sql
create table if not exists public.products (
  id         uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  price      text,
  created_at timestamptz not null default now()
);
```

### `academia_posts`

Contenido de Academia StarU. `author_id` apunta a `profiles`.

```sql
create table if not exists public.academia_posts (
  id         uuid primary key default uuid_generate_v4(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  content    text not null,
  cover_url  text,
  created_at timestamptz not null default now()
);
```

### `community_threads` y `community_replies`

Foros de Comunidad. Un hilo tiene muchas respuestas; borrar el hilo borra sus
respuestas (cascade).

```sql
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
```

### `convocatorias`

Eventos, concursos, webinars, etc. Aquí `author_id` usa `on delete set null`
(la convocatoria sobrevive aunque su autor desaparezca).

```sql
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
```

### Resumen de relaciones

| Tabla | FK | Apunta a | On delete |
|-------|----|----------|-----------|
| `profiles` | `id` | `auth.users(id)` | cascade |
| `products` | `profile_id` | `profiles(id)` | cascade |
| `academia_posts` | `author_id` | `profiles(id)` | cascade |
| `community_threads` | `author_id` | `profiles(id)` | cascade |
| `community_replies` | `thread_id` / `author_id` | `community_threads(id)` / `profiles(id)` | cascade |
| `convocatorias` | `author_id` | `profiles(id)` | **set null** |

---

## Trigger `handle_new_user`

Cuando alguien se registra (se inserta una fila en `auth.users`), **no**
creamos el perfil desde el frontend: lo hace un trigger en la base de datos.
Esto garantiza que **siempre** exista un `profiles` por cada usuario, y es la
pieza que aprovechamos para el sembrado (ver [doc 4](./04-sembrado-de-datos.md)).

```sql
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
```

Cómo funciona:

- Se dispara **after insert** sobre `auth.users`.
- Lee `raw_user_meta_data` (un JSON) para sacar `role`, `full_name` y `city`.
- Si no viene `role`, usa `'emprendimiento'` por defecto (`coalesce`).
- Es `security definer`, así que corre con privilegios para escribir en
  `public.profiles` aunque quien registra no los tenga.

El resto de campos del perfil (avatar, descripción, intereses, etc.) se
completan después con un `UPDATE`.

---

## Row Level Security (RLS)

Todas las tablas tienen RLS **habilitado**. El patrón general es:

- **Lectura pública** (`select using (true)`): cualquiera puede ver perfiles,
  productos, posts, hilos, respuestas y convocatorias. Es un directorio público.
- **Escritura del dueño**: solo el dueño (`auth.uid() = <columna del autor>`)
  puede crear/editar sus propias filas.

| Tabla | SELECT | Escritura |
|-------|--------|-----------|
| `profiles` | público | `update`/`insert` solo si `auth.uid() = id` |
| `products` | público | `for all` solo si `auth.uid() = profile_id` |
| `academia_posts` | público | `for all` solo si `auth.uid() = author_id` |
| `community_threads` | público | `insert`/`update` solo si `auth.uid() = author_id` |
| `community_replies` | público | `insert` solo si `auth.uid() = author_id` |
| `convocatorias` | público | `insert` solo si `auth.uid() = author_id` |

Ejemplo representativo (perfiles):

```sql
create policy "perfiles visibles para todos"
  on public.profiles for select using (true);

create policy "el usuario edita su propio perfil"
  on public.profiles for update using (auth.uid() = id);

create policy "el usuario inserta su propio perfil"
  on public.profiles for insert with check (auth.uid() = id);
```

> Por eso la **anon key** es segura de exponer en el frontend: la seguridad real
> la imponen estas políticas, no el secreto de la clave.

---

## Storage (buckets)

Se crean tres buckets **públicos para lectura**:

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('pitches', 'pitches', true), ('academia', 'academia', true)
on conflict (id) do nothing;
```

| Bucket | Uso |
|--------|-----|
| `avatars` | Fotos de perfil. |
| `pitches` | Videos pitch de emprendimientos/startups. |
| `academia` | Portadas de los posts de Academia. |

Políticas sobre `storage.objects`:

- **Lectura pública** de los tres buckets (necesario para mostrar avatares y
  reproducir los videos sin estar logueado).
- **Subida solo para autenticados** (`to authenticated`).
- **Actualizar/borrar** solo los archivos propios (`owner = auth.uid()`).

En el código, estos buckets están reflejados en `src/lib/supabase.js`:

```js
export const BUCKETS = { avatars: 'avatars', pitches: 'pitches', academia: 'academia' }
```

y el helper `uploadFile(bucket, file, pathPrefix)` sube el archivo con un nombre
único y devuelve su URL pública mediante `getPublicUrl`.

> ⚠️ Storage **protege el borrado por SQL** con un trigger
> (`storage.protect_delete`): no se pueden eliminar objetos con un simple
> `delete from storage.objects`. Esto es relevante en la limpieza de datos, ver
> [doc 3](./03-limpieza-base-de-datos.md).
</content>
