# 7. Despliegue en GitHub Pages

**App en vivo:** <https://jorgeoreaya.github.io/StarU/>

Este documento explica de forma reproducible cómo dejamos la app desplegada en
GitHub Pages, qué fallaba al principio y cada pieza de la solución.

---

## El problema original: pantalla en blanco

GitHub Pages estaba en **modo "legacy"** (sirviendo una rama/carpeta tal cual).
Eso servía el **código fuente crudo** del repo (un `index.html` que apunta a
`src/main.jsx`, módulos sin compilar) en vez del **build** de Vite. El navegador
no sabía qué hacer con eso y el resultado era una **pantalla en blanco**.

Para una SPA de Vite hay que servir el **resultado de `npm run build`** (la
carpeta `dist/`), no las fuentes. Y hay tres detalles que, si faltan, también
producen pantalla en blanco. Los resolvemos a continuación.

---

## Pieza 1 — `base` correcto en `vite.config.js`

La app no se sirve en la raíz del dominio, sino bajo el subpath del repo:
`https://jorgeoreaya.github.io/StarU/`. Vite necesita saberlo para generar las
rutas de los assets con ese prefijo (`/StarU/assets/...`). Si no, busca los
assets en `/assets/...` y no los encuentra → pantalla en blanco.

La clave: el `base` debe aplicarse **solo en build**, no en desarrollo (donde la
app corre en la raíz `http://localhost:5173/`). Por eso usamos la **forma de
función** de `defineConfig`, que recibe `command`:

```js
// vite.config.js
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/StarU/' : '/',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, open: true },
}))
```

## Pieza 2 — `basename` en el Router

Como la app vive bajo `/StarU/`, react-router también debe saberlo, o las rutas
internas (`/explorar`, `/login`, …) no resolverán bien. En `src/main.jsx`, el
`BrowserRouter` toma el mismo prefijo que Vite expone en `import.meta.env.BASE_URL`:

```jsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

Así, `import.meta.env.BASE_URL` vale `/StarU/` en producción y `/` en desarrollo,
quedando ambos lados (Vite y Router) sincronizados con una sola fuente de verdad.

## Pieza 3 — Variables de entorno en el build (¡crítico!)

`src/lib/supabase.js` llama a `createClient(supabaseUrl, supabaseAnonKey)` con
valores que vienen de `import.meta.env.VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`. Estas se **inyectan en tiempo de build**.

Si faltan al construir en CI, el cliente se crea con `undefined`, **`createClient`
revienta** y la app queda en blanco. Por eso el build en Actions **debe** recibir
esas variables. Las configuramos como **Variables del repositorio** (Settings →
Secrets and variables → Actions → *Variables*):

| Variable de Actions | Contenido |
|---------------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (`https://<proyecto>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | La **anon/public** key (pública por diseño; la seguridad la dan las RLS) |

> Se usan como `${{ vars.* }}` en el workflow. La *anon key* es pública por
> diseño; **nunca** se pone aquí la `service_role`.

## Pieza 4 — Fallback de SPA (`404.html`)

GitHub Pages no conoce las rutas del cliente: si alguien entra directo a
`/StarU/explorar`, Pages busca ese archivo, no lo encuentra y devuelve su 404.
El truco estándar para SPAs es **copiar `index.html` a `404.html`** en el build,
para que cualquier ruta desconocida cargue la app y el Router resuelva del lado
del cliente.

## Pieza 5 — Cambiar Pages a modo "GitHub Actions"

En **Settings → Pages → Build and deployment → Source**, se cambió de "Deploy
from a branch" (legacy) a **"GitHub Actions"**. Así Pages publica el artefacto
que produce el workflow, no una carpeta cruda del repo.

---

## El workflow completo

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

# Permisos necesarios para publicar en GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Un solo despliegue a la vez
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: SPA fallback (404 -> index)
        run: cp dist/index.html dist/404.html

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Lectura del workflow

- **Disparadores**: cada `push` a `main` (o manualmente con `workflow_dispatch`).
- **Permisos**: `pages: write` e `id-token: write` son necesarios para
  `deploy-pages`.
- **concurrency**: un solo despliegue a la vez; cancela el anterior si llega uno
  nuevo.
- **Job `build`**: Node **20**, `npm ci` (instalación reproducible desde el
  lockfile), `npm run build` con las dos variables `VITE_*` inyectadas, copia del
  `404.html` y subida del artefacto con `upload-pages-artifact@v3` apuntando a
  `dist`.
- **Job `deploy`**: depende de `build` y publica con `deploy-pages@v4`,
  exponiendo la URL del despliegue en el entorno `github-pages`.

---

## Checklist para reproducir el despliegue

1. `vite.config.js` con `base: '/StarU/'` solo en `command === 'build'`. ✅
2. `BrowserRouter basename={import.meta.env.BASE_URL}` en `main.jsx`. ✅
3. Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` definidas en
   Settings → Variables de Actions. ✅
4. Workflow `.github/workflows/deploy.yml` presente. ✅
5. Pages en modo **GitHub Actions** (Settings → Pages → Source). ✅
6. `git push origin main` → Actions construye y publica solo. ✅
</content>
