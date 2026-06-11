# 6. Rendimiento percibido en móvil

En móvil la app **se sentía lenta al cargar**, aunque en realidad no lo era. El
culpable era la animación de scroll-reveal: el contenido empezaba **invisible** y
solo aparecía al hacer scroll. En una pantalla pequeña, mucho de ese contenido
quedaba "esperando" a entrar en viewport, dando la sensación de que la página no
terminaba de cargar.

---

## El scroll-reveal: cómo funciona

El efecto combina un hook y unas clases CSS.

**Hook `useReveal`** (`src/lib/useReveal.js`): devuelve un `ref` y un booleano
`shown`. Observa el elemento con `IntersectionObserver` y pone `shown = true`
cuando entra en viewport.

```jsx
const { ref, shown } = useReveal()
<div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''}`}>…</div>
```

**Clases CSS** (`src/styles/global.css`): `.reveal` arranca invisible y
desplazado; `.reveal-in` lo lleva a su posición final.

```css
.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.reveal-in { opacity: 1; transform: none; }
```

---

## La solución

La idea central: **en móvil el contenido aparece al instante**; el efecto de
entrada queda reservado para desktop, donde sí se aprecia y no estorba. La
solución actúa en dos frentes (CSS y JS) para cubrir todos los casos.

### 1. CSS: mostrar al instante en pantallas ≤700px

En `≤700px` neutralizamos el `.reveal` para que el contenido sea visible desde el
primer pintado, y eliminamos los retardos escalonados (`.reveal-d1`…`.reveal-d6`)
que agravaban la sensación de lentitud:

```css
@media (max-width: 700px) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: opacity 0.3s ease;
  }
  .reveal-d1, .reveal-d2, .reveal-d3,
  .reveal-d4, .reveal-d5, .reveal-d6 {
    transition-delay: 0s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

### 2. JS: el hook detecta móvil / reduce-motion / sin IntersectionObserver

Aunque el CSS ya lo cubre, el hook hace `setShown(true)` **inmediatamente** si
detecta cualquiera de estas condiciones, para no depender solo del observador:

```js
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const isMobile = window.matchMedia?.('(max-width: 700px)').matches
if (reduceMotion || isMobile || typeof IntersectionObserver === 'undefined') {
  setShown(true)
  return
}
```

### 3. rootMargin que dispara antes (desktop)

En desktop, el observer usa un `rootMargin` positivo para revelar el contenido
**un poco antes** de que entre del todo en la vista, de modo que no se vea el
"salto" de aparición:

```js
{ threshold: 0.1, rootMargin: '0px 0px 80px 0px', ...options }
```

### 4. Respaldo por timeout

Como red de seguridad, si por cualquier motivo el observer no dispara (un caso
raro de layout o navegador), un `setTimeout` revela el contenido tras **1.2 s**,
para que nunca quede invisible:

```js
const fallback = setTimeout(() => setShown(true), 1200)
// limpieza:
return () => { obs.disconnect(); clearTimeout(fallback) }
```

---

## Ajustes de layout del landing en móvil

Junto con el scroll-reveal, se afinó el espaciado y la ergonomía táctil en
`src/pages/Landing.css`:

- **Banda CTA**: se ajustó el espaciado vertical para que no quede pegada al
  resto del contenido. En `≤640px` se reduce el margen inferior.

  ```css
  @media (max-width: 640px) {
    .landing-cta-band { margin-bottom: 40px; }
  }
  ```

- **Botones a ancho completo en móvil**: en `≤480px` los CTAs del hero y de la
  banda CTA pasan a `width: 100%`. Son más cómodos de tocar y se ven más
  prolijos:

  ```css
  @media (max-width: 480px) {
    .landing-ctas { width: 100%; gap: 10px; }
    .landing-ctas > * { width: 100%; }
    .landing-cta-band .btn { width: 100%; }
  }
  ```

---

## Resultado

En móvil la página **se muestra de inmediato** (sin efecto de entrada percibido
como "carga"), respeta `prefers-reduced-motion`, y en desktop conserva el
scroll-reveal suave con su curva `cubic-bezier(0.16, 1, 0.3, 1)`.
</content>
