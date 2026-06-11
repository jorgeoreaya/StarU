# 4. Sembrado de datos de ejemplo

Esta es la parte más delicada del proceso. Sembramos una base coherente y
realista que cubre todas las secciones de la app:

| Contenido | Cantidad | Detalle |
|-----------|----------|---------|
| Perfiles de emprendimiento/startup | **6** | Rubros variados; **3 con video pitch**. |
| Perfiles de inversor | **4** | Distintos tipos de inversor. |
| Productos | **13** | Repartidos entre los emprendimientos. |
| Posts de Academia | **3** | Con portada. |
| Hilos de Comunidad | **3** | — |
| Respuestas de Comunidad | **2** | Sobre los hilos anteriores. |
| Convocatorias | **4** | Distintos tipos de evento. |

Total: **10 cuentas demo** (6 emprendimientos + 4 inversores).

---

## El reto: crear usuarios que puedan iniciar sesión, desde SQL

No usamos la API de registro del frontend para cada cuenta. En su lugar
**insertamos directamente en el esquema `auth`** de Supabase y dejamos que el
trigger `handle_new_user` haga el trabajo de crear el perfil. Crear un usuario
de auth utilizable por SQL tiene **tres piezas**:

1. **`auth.users`** — la cuenta en sí, con la contraseña hasheada y la
   `raw_user_meta_data` que el trigger leerá (`role`, `full_name`, `city`).
2. **El trigger `handle_new_user`** se dispara solo al insertar en `auth.users`
   y crea la fila base en `public.profiles`.
3. **`auth.identities`** — la identidad del proveedor *email*. **Sin esta fila el
   usuario existe pero no puede iniciar sesión.**

Luego, un **`UPDATE`** sobre `profiles` completa el resto de los campos
(avatar, descripción, intereses, video pitch, etc.).

### Convenciones de las cuentas demo

- **Patrón de correo:** `<algo>@demo.staru.app`
- **Contraseña demo compartida:** `StarU2025!`
- La contraseña se almacena hasheada con bcrypt vía
  `crypt('StarU2025!', gen_salt('bf'))` (extensión `pgcrypto`).

> Las cuentas demo son **desechables**; por eso es seguro documentar el patrón de
> correo y la contraseña compartida.

---

## Paso 1 — Insertar en `auth.users`

Cada usuario se inserta con su `raw_user_meta_data` (lo que el trigger leerá) y
la contraseña hasheada. Ejemplo abreviado (una fila):

```sql
insert into auth.users (
  instance_id, id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'maria.quispe@demo.staru.app',
  crypt('StarU2025!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'role', 'emprendimiento',
    'full_name', 'María Quispe',
    'city', 'La Paz'
  )
);
```

Puntos importantes:

- `email_confirmed_at = now()` deja la cuenta **ya confirmada**, así puede
  loguearse sin pasar por el correo de verificación.
- `raw_user_meta_data` lleva exactamente las claves que el trigger
  `handle_new_user` espera: `role`, `full_name`, `city`.
- En cuanto se ejecuta este `insert`, el trigger crea la fila correspondiente en
  `public.profiles` con esos tres campos + `id` + `email`.

## Paso 2 — Insertar en `auth.identities`

Necesario para que el login por email funcione. Se hace por **join por email**
contra los usuarios recién creados:

```sql
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,                                   -- provider_id = id para email
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(), now(), now()
from auth.users u
where u.email like '%@demo.staru.app';
```

## Paso 3 — Completar los perfiles con `UPDATE` (join por email)

El trigger solo rellenó `id`, `role`, `full_name`, `email` y `city`. El resto se
completa con un `UPDATE` que localiza el perfil **por email**:

```sql
-- Ejemplo: completar un emprendimiento con video pitch
update public.profiles p
set
  business_name   = 'Sabores del Altiplano',
  rubro           = 'Gastronomía',
  experience      = '2 - 5 años',
  description     = 'Comida andina gourmet con ingredientes nativos: quinua real, tunta y llajwa artesanal.',
  avatar_url      = 'https://i.pravatar.cc/400?img=45',
  pitch_video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
where p.email = 'maria.quispe@demo.staru.app';

-- Ejemplo: completar un inversor (sin video, con intereses)
update public.profiles p
set
  company       = 'Illimani Ventures',
  investor_type = 'Fondo de Inversión',
  interests     = array['Tecnología', 'Todos'],
  bio           = 'Managing Partner de un fondo enfocado en startups bolivianas con potencial regional.'
where p.email = 'valeria.suarez@demo.staru.app';
```

> Los `rubro`, `investor_type`, `experience` e `interests` usan los valores
> exactos de `src/lib/constants.js` (`RUBROS`, `INVESTOR_TYPES`,
> `EXPERIENCE_OPTIONS`, `INTEREST_SECTORS`) para que coincidan con los filtros de
> la UI.

## Paso 4 — Productos y contenido (join por email)

Productos, posts, hilos, respuestas y convocatorias se insertan resolviendo el
`profile_id`/`author_id` con un **subselect por email**, en vez de pegar UUIDs a
mano:

```sql
-- Productos de un emprendimiento
insert into public.products (profile_id, name, price)
select p.id, v.name, v.price
from public.profiles p
join (values
  ('Box andino para 2 personas', '120'),
  ('Llajwa artesanal 250ml', '25'),
  ('Catering evento (x persona)', '45')
) as v(name, price) on true
where p.email = 'maria.quispe@demo.staru.app';

-- Post de Academia
insert into public.academia_posts (author_id, title, content, cover_url)
select p.id,
       '¿Qué busca un inversor en tu pitch?',
       'Un buen pitch responde tres preguntas en menos de tres minutos...',
       'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'
from public.profiles p
where p.email = 'valeria.suarez@demo.staru.app';

-- Hilo de Comunidad + una respuesta
insert into public.community_threads (author_id, title, body)
select p.id, '¿Cómo exportan por primera vez desde Bolivia?', 'Tengo pedidos desde España pero me pierdo con la documentación...'
from public.profiles p
where p.email = 'ana.mamani@demo.staru.app';

insert into public.community_replies (thread_id, author_id, body)
select t.id, p.id, 'En Red Emprende damos talleres de comercio exterior gratuitos. Empieza por sacar tu NIT exportador...'
from public.community_threads t
join public.profiles p on p.email = 'carla.fuentes@demo.staru.app'
where t.title = '¿Cómo exportan por primera vez desde Bolivia?';

-- Convocatoria
insert into public.convocatorias (author_id, title, description, event_type, event_date, location, url)
select p.id,
       'Demo Day Illimani Ventures 2026',
       'Presenta tu startup ante un panel de inversores y fondos regionales.',
       'Concurso de Startups',
       date '2026-08-15',
       'La Paz – Hotel Casa Grande',
       'https://illimani.vc/demoday'
from public.profiles p
where p.email = 'valeria.suarez@demo.staru.app';
```

> Los ejemplos están **abreviados**: en el sembrado real se repite el patrón para
> las 6 cuentas de emprendimiento, las 4 de inversor, los 13 productos, los 3
> posts, los 3 hilos, las 2 respuestas y las 4 convocatorias.

---

## Origen de los medios de muestra

No subimos archivos a nuestros buckets de Storage; apuntamos a recursos públicos
externos:

| Tipo de medio | Origen | Ejemplo de URL |
|---------------|--------|----------------|
| Avatares | **i.pravatar.cc** | `https://i.pravatar.cc/400?img=45` |
| Videos pitch | **Bucket público de Google** (`gtv-videos-bucket`) | `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4` |
| Portadas (Academia) | **Unsplash** | `https://images.unsplash.com/photo-...` |

Esto mantiene el sembrado **100% en SQL**, sin depender de subir objetos ni de
limpiar Storage (que además bloquea el borrado por SQL, ver
[doc 3](./03-limpieza-base-de-datos.md)).

---

## Resumen de cuentas demo

> Contraseña compartida para **todas**: `StarU2025!`

**Emprendimientos / startups (rol `emprendimiento`):**

| Negocio | Rubro | Ciudad | Pitch | Correo |
|---------|-------|--------|-------|--------|
| Sabores del Altiplano | Gastronomía | La Paz | ✅ | `maria.quispe@demo.staru.app` |
| AndesPay | Tecnología | Cochabamba | ✅ | `carlos.mendoza@demo.staru.app` |
| Killa Textil | Moda | El Alto | — | `ana.mamani@demo.staru.app` |
| VidaSana Telemedicina | Salud | Santa Cruz | ✅ | `jorge.rojas@demo.staru.app` |
| EcoCultiva | Agricultura | Tarija | — | `lucia.vargas@demo.staru.app` |
| Aula Viva | Educación | Sucre | — | `pedro.choque@demo.staru.app` |

**Inversores (rol `inversor`):**

| Nombre / Empresa | Tipo | Ciudad | Correo |
|------------------|------|--------|--------|
| Andrés Gutiérrez · Gutiérrez Angels | Ángel Inversor | Santa Cruz | `andres.gutierrez@demo.staru.app` |
| Valeria Suárez · Illimani Ventures | Fondo de Inversión | La Paz | `valeria.suarez@demo.staru.app` |
| Roberto Andrade · Banco Productivo BO | Banco / Entidad Financiera | Cochabamba | `roberto.andrade@demo.staru.app` |
| Carla Fuentes · Red Emprende Bolivia | Organización de Apoyo | El Alto | `carla.fuentes@demo.staru.app` |

Para entrar con cualquiera de ellas: ir a **/login**, elegir el rol
correspondiente, usar el correo de la cuenta y la contraseña `StarU2025!`.
</content>
