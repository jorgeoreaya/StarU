# 3. Limpieza total de la base de datos

Antes de sembrar datos de ejemplo limpios y coherentes, hicimos un **reset
completo** de todos los datos de prueba que se habían ido acumulando durante el
desarrollo: filas en las tablas de la app, usuarios de autenticación e
identidades.

El objetivo era partir de una base vacía pero **conservando el esquema** (tablas,
RLS, trigger y buckets siguen existiendo; solo se borran los datos).

---

## Orden de borrado: respetar las FKs

Como las tablas están encadenadas por claves foráneas, hay que borrar de la
**hoja hacia la raíz** para no chocar contra las restricciones. El orden seguro es:

1. `community_replies` (depende de `community_threads` y `profiles`)
2. `community_threads` (depende de `profiles`)
3. `convocatorias` (depende de `profiles`, pero con `set null`)
4. `academia_posts` (depende de `profiles`)
5. `products` (depende de `profiles`)
6. `profiles` (depende de `auth.users`)
7. `auth.users` y `auth.identities` (la raíz de la autenticación)

> Nota: como `profiles → auth.users` es `on delete cascade`, borrar primero
> `auth.users` también arrastraría `profiles` y todo lo que cuelga de él. Aun
> así borramos en orden explícito para que el resultado sea predecible y el SQL
> se lea con claridad.

### SQL representativo del reset

```sql
-- 1. Tablas de la aplicación (de hijos a padres)
delete from public.community_replies;
delete from public.community_threads;
delete from public.convocatorias;
delete from public.academia_posts;
delete from public.products;
delete from public.profiles;

-- 2. Autenticación: usuarios e identidades.
--    Al ser profiles -> auth.users ON DELETE CASCADE, borrar identities
--    primero y luego users deja todo limpio.
delete from auth.identities;
delete from auth.users;
```

Tras esto, las seis tablas de `public` quedan vacías y no queda ningún usuario
de autenticación ni identidad asociada.

---

## El detalle de Storage

**Storage no se puede limpiar con un `DELETE` de SQL.** Supabase protege
`storage.objects` con un trigger (`storage.protect_delete`) que **bloquea el
borrado directo** de objetos por SQL. Si se intenta:

```sql
delete from storage.objects where bucket_id in ('avatars', 'pitches', 'academia');
-- ❌ Falla por el trigger storage.protect_delete
```

Por eso los archivos de Storage **se gestionan aparte** del reset SQL. Las
opciones para vaciarlos son:

- Borrarlos desde el **Dashboard de Supabase** (Storage → bucket → seleccionar
  y eliminar).
- Usar la **API/SDK de Storage** (`supabase.storage.from(bucket).remove([...])`).

En la práctica, para el sembrado **no necesitamos borrar Storage**: los datos de
ejemplo apuntan a **medios externos** (avatares de i.pravatar.cc, videos del
bucket público de Google, portadas de Unsplash), así que no dependemos de
objetos subidos a nuestros buckets. Ver [doc 4](./04-sembrado-de-datos.md).

---

## Verificación rápida

Después del reset conviene confirmar que todo quedó en cero:

```sql
select
  (select count(*) from public.profiles)          as profiles,
  (select count(*) from public.products)          as products,
  (select count(*) from public.academia_posts)    as academia,
  (select count(*) from public.community_threads) as threads,
  (select count(*) from public.community_replies) as replies,
  (select count(*) from public.convocatorias)     as convocatorias,
  (select count(*) from auth.users)               as usuarios;
```

Todas las columnas deben devolver `0`.
</content>
