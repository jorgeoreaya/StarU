import { useEffect, useMemo, useState } from 'react'
import { Search, Rocket, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProfileCard from '../components/ProfileCard'
import { useReveal } from '@/lib/useReveal'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './Explore.css'

const TABS = [
  { key: 'emprendimiento', label: 'Emprendimientos', Icon: Rocket },
  { key: 'inversor', label: 'Inversores', Icon: Briefcase },
]

export default function Explore() {
  const [tab, setTab] = useState('emprendimiento')
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const hero = useReveal()
  const toolbar = useReveal()

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', tab)
        .order('created_at', { ascending: false })
      if (active) {
        setProfiles(error ? [] : data ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [tab])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter((p) =>
      [p.full_name, p.business_name, p.rubro, p.company, p.investor_type, p.city]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    )
  }, [profiles, search])

  return (
    <div className="page explore-page">
      <div className="container">
        {/* Hero de sección: título grande a la izquierda + contador a la derecha */}
        <div
          ref={hero.ref}
          className={`explore-hero reveal ${hero.shown ? 'reveal-in' : ''}`}
        >
          <div className="explore-hero-text">
            <h1>
              Explorar <span className="text-gradient">perfiles</span>
            </h1>
            <p>Descubre emprendimientos, startups e inversores para conectar</p>
          </div>
          <div className="explore-count" aria-live="polite">
            <span className="explore-count-num">{loading ? '—' : filtered.length}</span>
            <span className="explore-count-label">
              {filtered.length === 1 ? 'perfil' : 'perfiles'}
            </span>
          </div>
        </div>

        {/* Barra de herramientas contenida: búsqueda + pestañas en una tarjeta */}
        <div
          ref={toolbar.ref}
          className={`explore-toolbar reveal reveal-d1 ${toolbar.shown ? 'reveal-in' : ''}`}
        >
          <div className="search-bar">
            <Search size={20} />
            <Input
              type="text"
              placeholder="Buscar por nombre, rubro, negocio o ciudad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent h-auto px-0 py-3 focus-visible:ring-0"
            />
          </div>
          <Tabs value={tab} onValueChange={setTab} className="explore-tabs">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  <t.Icon size={16} /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Search size={48} /></div>
            <h3>No se encontraron perfiles</h3>
            <p>Prueba con otra pestaña o términos de búsqueda diferentes.</p>
          </div>
        ) : (
          <div className="explore-grid">
            {filtered.map((p, i) => (
              <RevealCard key={p.id} index={i}>
                <ProfileCard profile={p} />
              </RevealCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Envoltura que revela cada tarjeta al entrar en viewport, escalonada por columna.
function RevealCard({ children, index }) {
  const { ref, shown } = useReveal()
  const delay = `reveal-d${(index % 6) + 1}`
  return (
    <div ref={ref} className={`reveal ${delay} ${shown ? 'reveal-in' : ''}`}>
      {children}
    </div>
  )
}
