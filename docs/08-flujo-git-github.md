# 8. Flujo de trabajo Git/GitHub

Este documento cubre cómo subimos el proyecto a GitHub, cómo se reemplazó la
versión antigua del repo, y los flujos del día a día para **correr localmente** y
**desplegar**.

---

## Cómo subimos el proyecto

### Inicialización y autor

El proyecto se inicializó como repo Git y se configuró la identidad del autor:

```bash
git init
git config user.name "jorgeoreaya"
git config user.email "orellanaayalajorgesantiago@gmail.com"

git add .
git commit -m "StarU: app React + Vite + Supabase con despliegue a Pages"
```

### Reemplazo de la versión antigua (force push)

El repositorio remoto **ya tenía una versión antigua** del proyecto, construida
con **Next.js**. Esa versión se descartó por completo y se reemplazó con la nueva
base React + Vite. Como el historial nuevo no es compatible con el viejo, se hizo
un **force push**:

```bash
git remote add origin https://github.com/jorgeoreaya/StarU.git
git branch -M main
git push --force origin main
```

> El `--force` sobrescribe el contenido remoto con el local. Es la operación
> correcta aquí porque queríamos **descartar** la versión Next.js, no fusionarla.

---

## Secretos fuera del control de versiones

Las credenciales **no se versionan**. El `.gitignore` excluye los archivos de
entorno:

```gitignore
# env
.env
.env.local
.env.*.local
```

En su lugar, **`.env.example`** queda en el repo como plantilla documentada (sin
valores reales):

```bash
# .env.example
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key
```

Así:

- `.env.local` (con los valores reales) vive **solo** en la máquina de cada quien.
- `.env.example` documenta **qué** variables hacen falta.
- En el despliegue, esas variables se inyectan desde las **Variables de Actions**
  (ver [doc 7](./07-despliegue-github-pages.md)), no desde un archivo.

> La `anon key` es pública por diseño (se usa en el frontend). La seguridad real
> la imponen las políticas **RLS** (ver [doc 2](./02-modelo-de-datos-supabase.md)).
> **Nunca** se versiona ni se pone la `service_role` key.

---

## Cómo correr localmente

Requisitos: **Node.js 18+** y un proyecto de Supabase con el esquema cargado
(`supabase/schema.sql`).

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar las credenciales de Supabase
cp .env.example .env.local
#    Edita .env.local y pega tus valores reales:
#      VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
#      VITE_SUPABASE_ANON_KEY=<tu-anon-public-key>

# 3. Levantar el servidor de desarrollo
npm run dev        # http://localhost:5173 (se abre solo)
```

Otros scripts (`package.json`):

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Servidor de desarrollo (Vite) en `http://localhost:5173`. |
| `npm run build` | Build de producción en `dist/`. |
| `npm run preview` | Previsualiza el build de producción localmente. |

> Si faltan las variables, `src/lib/supabase.js` imprime un error claro en
> consola pidiendo copiar `.env.example` a `.env.local`.

### Preparar Supabase la primera vez

1. Crear un proyecto en Supabase.
2. **SQL Editor → New query**: pegar y ejecutar todo `supabase/schema.sql`
   (crea tablas, RLS, trigger y buckets).
3. (Recomendado en dev) **Authentication → Sign In / Providers → Email**:
   desactivar *"Confirm email"* para que el registro inicie sesión al instante.
4. (Opcional) Ejecutar el sembrado de datos demo
   (ver [doc 4](./04-sembrado-de-datos.md)).

---

## Cómo desplegar

El despliegue es **automático**: cada push a `main` dispara el workflow de
GitHub Actions que construye y publica en GitHub Pages.

```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main      # Actions construye y publica solo
```

Tras unos segundos/minutos, los cambios quedan en vivo en
<https://jorgeoreaya.github.io/StarU/>.

> El detalle del workflow, las variables necesarias y la configuración de Pages
> están en [doc 7](./07-despliegue-github-pages.md). También se puede lanzar
> manualmente desde la pestaña **Actions** del repo (`workflow_dispatch`).
</content>
