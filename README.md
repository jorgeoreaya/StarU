# StarU 🌟

Plataforma que conecta **emprendedores y startups** con **inversores**. Los fundadores crean un perfil con productos, fotos y un **video pitch**; los inversores exploran oportunidades y conectan. Incluye además **Academia StarU**, **Comunidad** (foros) y **Convocatorias** (eventos).

Construido con **React + Vite** y **Supabase** (Auth + Postgres + Storage).

---

## 1. Requisitos

- Node.js 18+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## 2. Instalación

```bash
npm install
```

## 3. Configurar Supabase

### a) Credenciales

Copia `.env.example` a `.env.local` y pega tus valores
(Dashboard → **Project Settings → API**):

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key
```

> La *anon key* es pública por diseño (se usa en el frontend). La seguridad real la imponen las políticas RLS del paso siguiente. **Nunca** pongas aquí la `service_role` key.

### b) Base de datos

En el Dashboard de Supabase ve a **SQL Editor → New query**, pega todo el
contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Eso crea:

- Tablas: `profiles`, `products`, `academia_posts`, `community_threads`,
  `community_replies`, `convocatorias`
- Políticas **RLS** (lectura pública, escritura solo del dueño)
- Buckets de Storage: `avatars`, `pitches`, `academia`
- Trigger `handle_new_user` que crea el perfil al registrarse

### c) Confirmación de email (recomendado para desarrollo)

En **Authentication → Sign In / Providers → Email**, desactiva
*"Confirm email"* para que el registro inicie sesión al instante. Si lo dejas
activado, el usuario deberá confirmar por correo antes de subir su foto/video.

## 4. Ejecutar

```bash
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # previsualizar el build
```

---

## Estructura

```
src/
├─ lib/
│  ├─ supabase.js     # cliente + helper uploadFile
│  └─ constants.js    # rubros, tipos de inversor, etc.
├─ context/AuthContext.jsx   # sesión + perfil del usuario
├─ components/        # Navbar, ProfileCard, ProfileDetail, MediaUploader, Toast…
└─ pages/
   ├─ Landing.jsx        # inicio (solo presentación)
   ├─ Login.jsx          # login dual (emprendedor / inversor)
   ├─ Register.jsx       # registro en 4 pasos según rol
   ├─ Explore.jsx        # pestañas Emprendimientos / Startups / Inversores
   ├─ MyProfile.jsx      # ver y editar el perfil propio
   ├─ ViewProfile.jsx    # ver el perfil de otro usuario
   ├─ Academia.jsx
   ├─ Comunidad.jsx
   └─ Convocatorias.jsx
```

## Roles

- **Emprendimiento** 🚀 y **Startup** ⚡: perfil con negocio, rubro, productos,
  foto y video pitch. Se muestran en pestañas separadas en Explorar.
- **Inversor** 💼: perfil profesional con empresa, tipo, sectores de interés y
  biografía (sin video).

## Notas

- Los buckets son públicos para lectura (necesario para reproducir el pitch y
  mostrar avatares). La subida requiere sesión iniciada.
- El registro usa `signUp` con el rol en la metadata; el trigger de la base de
  datos crea la fila en `profiles`, que luego se completa con el resto de datos.
```
