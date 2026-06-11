# 1. Visión general y stack

## Qué es StarU

**StarU** es una plataforma que **conecta emprendedores y startups con
inversores**. Los fundadores crean un perfil con su negocio, rubro, productos,
foto y un **video pitch**; los inversores exploran esas oportunidades y conectan.

Además del directorio de perfiles, la app incluye tres secciones de contenido:

- **Explorar** — directorio de perfiles con pestañas para emprendimientos,
  startups e inversores.
- **Academia** — posts de contenido educativo (Academia StarU).
- **Comunidad** — foros con hilos y respuestas.
- **Convocatorias** — eventos, concursos, webinars y oportunidades.

### Roles

El campo `role` de un perfil solo admite dos valores en la base de datos:
`'inversor'` o `'emprendimiento'`. Conceptualmente las **startups son
emprendimientos**; se diferencian en la UI (pestañas separadas en Explorar)
pero a nivel de datos comparten el rol `emprendimiento`.

| Rol (UI) | `role` en BD | Tiene video pitch | Campos propios |
|----------|--------------|-------------------|----------------|
| Emprendimiento 🚀 | `emprendimiento` | Sí | `business_name`, `rubro`, `experience`, `description`, `pitch_video_url`, `products` |
| Startup ⚡ | `emprendimiento` | Sí | (los mismos que emprendimiento) |
| Inversor 💼 | `inversor` | No | `company`, `investor_type`, `interests[]`, `bio` |

---

## Stack real

Tomado de `package.json`:

| Capa | Tecnología | Versión (aprox.) |
|------|------------|------------------|
| UI | React | `^18.3.1` |
| Bundler / dev server | Vite | `^5.4.8` |
| Estilos utilitarios | TailwindCSS | `^3.4.19` (+ `tailwindcss-animate`) |
| Componentes accesibles | shadcn/ui sobre **Radix** | `@radix-ui/react-dialog`, `-label`, `-select`, `-slot`, `-tabs` |
| Routing | react-router-dom | `^6.26.2` |
| Backend | Supabase JS (`@supabase/supabase-js`) | `^2.45.4` |
| Iconos | lucide-react | `^1.17.0` |
| Utilidades de clases | `clsx`, `tailwind-merge`, `class-variance-authority` | — |

Supabase aporta los tres pilares del backend: **Auth** (registro/login),
**Postgres** (datos) y **Storage** (avatares, videos pitch y portadas).

### Componentes shadcn/ui

Los primitivos de UI viven en `src/components/ui/` y son wrappers de Radix con
estilos: `button`, `card`, `badge`, `dialog`, `input`, `textarea`, `select`,
`tabs`, `label`. La configuración del CLI de shadcn está en `components.json`.

---

## Estructura de carpetas

Derivada de leer `src/`:

```
StarU/
├─ index.html                  # punto de entrada HTML
├─ vite.config.js              # config Vite (base, alias @, server)
├─ tailwind.config.js          # config Tailwind
├─ postcss.config.js
├─ components.json             # config del CLI shadcn/ui
├─ jsconfig.json
├─ .env.example                # plantilla de variables (sin secretos reales)
├─ .github/workflows/deploy.yml  # CI/CD a GitHub Pages
├─ supabase/
│  └─ schema.sql               # esquema completo: tablas, RLS, trigger, buckets
└─ src/
   ├─ main.jsx                 # bootstrap: Router + providers (Theme/Toast/Auth)
   ├─ App.jsx                  # definición de rutas
   ├─ lib/
   │  ├─ supabase.js           # cliente Supabase + BUCKETS + helper uploadFile
   │  ├─ constants.js          # RUBROS, INVESTOR_TYPES, EVENT_TYPES, etc.
   │  ├─ useReveal.js          # hook de scroll-reveal (IntersectionObserver)
   │  ├─ icons.js
   │  └─ utils.js              # helper cn() (clsx + tailwind-merge)
   ├─ context/
   │  ├─ AuthContext.jsx       # sesión + perfil del usuario
   │  └─ ThemeContext.jsx      # modo claro/oscuro (clase .dark en el root)
   ├─ components/
   │  ├─ Navbar.jsx / Navbar.css
   │  ├─ ProfileCard.jsx       # tarjeta de perfil en Explorar
   │  ├─ ProfileDetail.jsx / ProfileDetail.css
   │  ├─ MediaUploader.jsx     # subida de avatar / pitch
   │  ├─ ProtectedRoute.jsx    # protege /mi-perfil
   │  ├─ Toast.jsx             # provider de notificaciones
   │  └─ ui/                   # primitivos shadcn/ui (Radix)
   ├─ pages/
   │  ├─ Landing.jsx / Landing.css
   │  ├─ Login.jsx / Register.jsx (+ Auth.css)
   │  ├─ Explore.jsx / Explore.css
   │  ├─ MyProfile.jsx / ViewProfile.jsx
   │  ├─ Academia.jsx / Comunidad.jsx / Convocatorias.jsx
   │  └─ Sections.css
   └─ styles/
      ├─ tailwind.css          # directivas @tailwind
      └─ global.css            # variables de tema (:root / .dark) y estilos base
```

### Rutas (`src/App.jsx`)

| Ruta | Página | Notas |
|------|--------|-------|
| `/` | `Landing` | Presentación. |
| `/login` | `Login` | Login dual (emprendedor / inversor). |
| `/registro` | `Register` | Registro en pasos según rol. |
| `/explorar` | `Explore` | Pestañas Emprendimientos / Startups / Inversores. |
| `/academia` | `Academia` | — |
| `/comunidad` | `Comunidad` | — |
| `/convocatorias` | `Convocatorias` | — |
| `/perfil/:id` | `ViewProfile` | Perfil público de otro usuario. |
| `/mi-perfil` | `MyProfile` | Protegida por `ProtectedRoute`. |
| `*` | `Landing` | Fallback. |

### Bootstrap (`src/main.jsx`)

La app se monta con el `BrowserRouter` usando
`basename={import.meta.env.BASE_URL}` (clave para GitHub Pages, ver
[doc 7](./07-despliegue-github-pages.md)) y envuelta en tres providers:
`ThemeProvider` → `ToastProvider` → `AuthProvider`.
</content>
