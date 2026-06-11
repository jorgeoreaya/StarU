# 5. Pulido visual

Esta sesión incluyó un trabajo importante de pulido visual. El cambio de fondo
fue migrar la app a un **modo claro/oscuro real** basado en variables CSS
*theme-aware*, además de varias mejoras de consistencia (badges, transiciones,
hover/focus, tooltips y breakpoints).

---

## Mecanismo de tema

El tema se controla con una **clase `.dark` en el elemento raíz**
(`document.documentElement`) gestionada por `ThemeContext`
(`src/context/ThemeContext.jsx`):

- El estado inicial se lee de `localStorage` (clave `staru-theme`); si no hay
  preferencia guardada, el **valor por defecto es `dark`** (la app nació en modo
  oscuro).
- Un `useEffect` añade o quita la clase `.dark` en el root y persiste la
  elección en `localStorage`.
- `toggleTheme()` alterna entre `'dark'` y `'light'`; el botón vive en la Navbar.

```jsx
useEffect(() => {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem('staru-theme', theme)
}, [theme])
```

---

## Variables CSS *theme-aware* (`:root` y `.dark`)

El problema de origen: el **navbar y los botones glass** usaban colores oscuros
fijos (`rgba(11,13,26,…)`, blancos translúcidos, etc.), que se veían bien en
oscuro pero **rompían el modo claro** (texto ilegible, superficies negras sobre
fondo blanco).

La solución fue mover esos colores a **variables CSS** definidas dos veces en
`src/styles/global.css`: una vez en `:root` (tema **claro**, el valor por
defecto) y otra en `.dark` (tema **oscuro**). Los componentes solo consumen las
variables, así que cambian de color automáticamente con el tema.

### Superficies translúcidas (navbar / glass)

```css
/* :root  → claro: superficies translúcidas claras sobre fondo claro */
--surface-glass: rgba(255, 255, 255, 0.72);
--glass-bg: rgba(0, 0, 0, 0.04);
--glass-bg-hover: rgba(0, 0, 0, 0.07);
--glass-border: rgba(0, 0, 0, 0.1);

/* .dark → oscuro: los valores originales del diseño */
--surface-glass: rgba(11, 13, 26, 0.78);
--glass-bg: rgba(255, 255, 255, 0.06);
--glass-bg-hover: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.12);
```

El `.navbar` y los `.btn-glass` ahora usan `var(--surface-glass)`,
`var(--glass-bg)`, etc., en vez de colores hardcodeados.

### Badges / pills por tema

Los badges y las pills de rol también se parametrizaron por tema, para que sean
**legibles en ambos modos**:

```css
/* :root (claro) */
--badge-bg: rgba(245, 158, 11, 0.16);
--badge-text: hsl(32.1 94.6% 38%);
--pill-emp-bg: rgba(245, 158, 11, 0.16);   --pill-emp-text: hsl(32.1 94.6% 38%);
--pill-startup-bg: rgba(16, 185, 129, 0.16); --pill-startup-text: hsl(160 84% 30%);
--pill-inv-bg: rgba(139, 92, 246, 0.16);   --pill-inv-text: hsl(258 70% 48%);

/* .dark (oscuro): los tonos claros originales */
--badge-text: #fcd34d;
--pill-emp-text: #fcd34d;
--pill-startup-text: #6ee7b7;
--pill-inv-text: #c4b5fd;
```

Las clases `.pill-emprendimiento`, `.pill-startup` y `.pill-inversor` consumen
esas variables. Cada rol tiene su acento de color consistente: **ámbar** para
emprendimiento, **verde** para startup, **violeta** para inversor.

### Gradientes de profundidad del fondo

El fondo del `body` usa dos *glows* radiales con variables `--bg-glow-1` y
`--bg-glow-2`, más intensos en claro y más sutiles en oscuro, para dar
profundidad sin romper ninguno de los dos modos.

---

## Curva de transición estandarizada

Se unificó la curva de easing en `cubic-bezier(0.16, 1, 0.3, 1)` (un *ease-out*
expresivo y suave) en las transiciones clave: botones (`.btn`), scroll-reveal
(`.reveal`), el toggle de rol del login, las role-cards y las transiciones de
paso del registro. Esto da una sensación de movimiento coherente en toda la app.

```css
.btn {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Mejoras de hover / focus

- **Botones**: `:hover` con elevación (`translateY(-2px)`) y estados `:disabled`
  atenuados.
- **Inputs (scoped a auth)**: `:hover` aclara el borde con `color-mix` hacia el
  primario; `:focus-visible` añade un anillo (`box-shadow`) de color primario.
- **Role-cards** (registro): hover elevado (`translateY(-6px)`), sombra teñida
  por rol y el acento superior que se engrosa de 4px a 6px.
- **Anillos de foco accesibles** (`:focus-visible`) en toggles, tags de interés y
  role-cards, en vez de quitar el outline sin reemplazo.

---

## Tooltips en textos truncados

Las tarjetas de perfil (`src/components/ProfileCard.jsx`) truncan el nombre y el
subtítulo cuando no caben. Para no perder información se añadió el atributo
`title`, que muestra el texto completo al pasar el cursor (tooltip nativo y
accesible):

```jsx
<h3 title={title || 'Sin nombre'}>{title || 'Sin nombre'}</h3>
<span className="profile-card-subtitle icon-inline" title={subtitle}>…</span>
```

---

## Acentos de color consistentes (modo inversor en Auth)

En `src/pages/Auth.css`, el panel decorativo del login (`.auth-aside`) cambia de
color según el rol seleccionado en el toggle. El modo inversor
(`[data-mode='inversor']`) tiñe el panel con el **violeta de marca del rol
inversor** (`#a78bfa`), el mismo que usan las pills y las role-cards, en vez de
un color suelto:

```css
.auth-split[data-mode='inversor'] .auth-aside {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #a78bfa 92%, #fff),
    color-mix(in srgb, #a78bfa 72%, #000)
  );
}
```

Como la textura/velo blancos estaban calibrados sobre el ámbar, en modo inversor
se atenúan ligeramente para que no se sobreexpongan sobre el violeta (más claro).

---

## Breakpoints para tablet

Se afinaron los breakpoints para que el layout respire en pantallas medianas, no
solo en móvil:

- `Landing.css`: la grilla de features pasa de 3 columnas a **2 columnas** en
  `≤1080px` y a **1 columna** en `≤640px`.
- `Navbar.css`: el menú colapsa a hamburguesa en `≤860px`.
- `Auth.css`: el login de dos paneles colapsa a uno en `≤860px`; el selector de
  rol pasa a una columna en `≤720px`.
- `ProfileDetail.css`: ajustes de layout en `≤860px`.

> Los arreglos específicos de **móvil** (`≤700px`/`≤480px`) — scroll-reveal,
> banda CTA y botones full-width — se detallan en
> [doc 6](./06-rendimiento-movil.md).
</content>
