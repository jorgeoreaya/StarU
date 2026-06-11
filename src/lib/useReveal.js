import { useEffect, useRef, useState } from 'react'

// Revela un elemento al entrar en viewport (scroll-reveal sin dependencias).
// Uso: const { ref, shown } = useReveal(); <div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''}`}>
export function useReveal(options = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Respeta reduce-motion, móviles y navegadores sin IntersectionObserver:
    // mostramos el contenido al instante en vez de dejarlo invisible.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 700px)').matches
    if (reduceMotion || isMobile || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            obs.unobserve(e.target)
          }
        })
      },
      // rootMargin positivo: revela un poco antes de entrar del todo a la vista.
      { threshold: 0.1, rootMargin: '0px 0px 80px 0px', ...options }
    )
    obs.observe(el)
    // Respaldo: si por alguna razón no dispara, revela tras 1.2s.
    const fallback = setTimeout(() => setShown(true), 1200)
    return () => {
      obs.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return { ref, shown }
}
