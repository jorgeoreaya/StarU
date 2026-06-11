# Documentación técnica de StarU

Esta carpeta documenta **cómo construimos y dejamos funcionando StarU** en esta
sesión: desde el stack y el modelo de datos hasta la limpieza de la base, el
sembrado de datos de ejemplo, el pulido visual, los arreglos de rendimiento
percibido en móvil, el despliegue en GitHub Pages y el flujo de trabajo con Git.

Está escrita para que cualquier persona del equipo pueda **entender y reproducir
cada paso**.

- **App en vivo:** <https://jorgeoreaya.github.io/StarU/>
- **Stack:** React 18 + Vite 5, TailwindCSS + shadcn/ui (sobre Radix),
  react-router-dom v6, Supabase (Auth + Postgres + Storage).

---

## Índice de documentos

| # | Documento | Qué cubre |
|---|-----------|-----------|
| 1 | [Visión general y stack](./01-vision-general-y-stack.md) | Qué es StarU, secciones, stack real y estructura de carpetas. |
| 2 | [Modelo de datos y Supabase](./02-modelo-de-datos-supabase.md) | Tablas, relación 1:1 con `auth.users`, trigger `handle_new_user`, RLS y buckets de Storage. |
| 3 | [Limpieza total de la base de datos](./03-limpieza-base-de-datos.md) | Reset completo de datos de prueba vía SQL, incluyendo `auth.users`/`auth.identities` y la nota sobre Storage. |
| 4 | [Sembrado de datos de ejemplo](./04-sembrado-de-datos.md) | Cómo creamos perfiles, productos y contenido demo insertando en `auth.users` y dejando que el trigger haga el resto. |
| 5 | [Pulido visual](./05-pulido-visual.md) | Modo claro/oscuro real con variables CSS theme-aware, badges/pills por tema, curva de transición estándar, hover/focus, tooltips, breakpoints. |
| 6 | [Rendimiento percibido en móvil](./06-rendimiento-movil.md) | Arreglo del scroll-reveal en móvil, espaciado de la banda CTA y botones full-width. |
| 7 | [Despliegue en GitHub Pages](./07-despliegue-github-pages.md) | El problema original, el `base`/`basename`, el workflow de Actions y las variables del repo. |
| 8 | [Flujo de trabajo Git/GitHub](./08-flujo-git-github.md) | Cómo subimos el proyecto, el force push sobre la versión vieja, cómo correr local y cómo desplegar. |

---

## Atajos rápidos

### Correr localmente

```bash
npm install
cp .env.example .env.local   # y pega tus credenciales de Supabase
npm run dev                  # http://localhost:5173
```

### Desplegar

```bash
git push origin main         # GitHub Actions construye y publica solo
```

> Detalle completo de ambos flujos en
> [08-flujo-git-github.md](./08-flujo-git-github.md).

---

## Cuentas demo

Las cuentas de demostración son **desechables** y comparten una contraseña común.

- **Patrón de correo:** `<algo>@demo.staru.app`
- **Contraseña demo (compartida):** `StarU2025!`

El listado completo de cuentas sembradas está en
[04-sembrado-de-datos.md](./04-sembrado-de-datos.md).
</content>
</invoke>
