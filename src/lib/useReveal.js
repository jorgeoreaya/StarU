import { useEffect, useRef, useState } from 'react'

// Revela un elemento al entrar en viewport (scroll-reveal sin dependencias).
// Uso: const { ref, shown } = useReveal(); <div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''}`}>
export function useReveal(options = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Respeta usuarios con reduce-motion.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, shown }
}
