import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Rocket,
  ClipboardList,
  Video,
  Search,
  GraduationCap,
  MessagesSquare,
  CalendarDays,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useReveal } from '@/lib/useReveal'
import { Button } from '@/components/ui/button'
import './Landing.css'

export default function Landing() {
  const [stats, setStats] = useState({ emprendedores: 0, inversores: 0, conexiones: 0 })
  const showcase = useReveal()
  const featGrid = useReveal()
  const cta = useReveal()

  useEffect(() => {
    async function loadStats() {
      const { count: emp } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['emprendimiento'])
      const { count: inv } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'inversor')
      setStats({
        emprendedores: emp ?? 0,
        inversores: inv ?? 0,
        conexiones: (emp ?? 0) + (inv ?? 0),
      })
    }
    loadStats()
  }, [])

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      {/* ===== HERO CENTRADO ===== */}
      <section className="container landing-hero">
        <div className="badge icon-inline">
          <Rocket size={15} /> La plataforma que conecta ideas con capital
        </div>
        <h1 className="landing-title">
          Conecta tu <span className="text-gradient">emprendimiento</span>
          <br />
          con quienes creen en ti
        </h1>
        <p className="landing-subtitle">
          StarU es el puente entre ideas innovadoras y el capital que las hace realidad.
          Crea tu perfil, presenta tu pitch y encuentra inversores dispuestos a apostar por tu visión.
        </p>
        <div className="landing-ctas">
          <Button asChild variant="gradient" size="lg">
            <Link to="/registro">
              Comenzar ahora <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/explorar">Explorar perfiles</Link>
          </Button>
        </div>
        <div className="landing-stats">
          <div className="stat">
            <span className="stat-number">{stats.emprendedores}</span>
            <span className="stat-label">Emprendedores</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">{stats.inversores}</span>
            <span className="stat-label">Inversores</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">{stats.conexiones}</span>
            <span className="stat-label">En la red</span>
          </div>
        </div>
      </section>

      {/* ===== MOCKUP DEL MARKETPLACE ===== */}
      <section className="container landing-showcase">
        <div
          ref={showcase.ref}
          className={`showcase-window reveal ${showcase.shown ? 'reveal-in' : ''}`}
        >
          <div className="showcase-bar">
            <span className="wdot" />
            <span className="wdot" />
            <span className="wdot" />
            <span className="showcase-url">staru.app / explorar</span>
          </div>
          <div className="showcase-body">
            {[
              { i: 'M', n: 'María López', r: 'Emprendedora · Gastronomía', t: 'emprendimiento' },
              { i: 'C', n: 'Carlos Ruiz', r: 'Inversor · Ángel', t: 'inversor' },
              { i: 'A', n: 'Ana Torres', r: 'Emprendedora · Tecnología', t: 'emprendimiento' },
            ].map((p) => (
              <div className="showcase-card" key={p.i}>
                <div className="showcase-avatar">{p.i}</div>
                <div className="showcase-info">
                  <span className="showcase-name">{p.n}</span>
                  <span className="showcase-role">{p.r}</span>
                </div>
                <span className={`pill pill-${p.t} showcase-pill`}>{p.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="container features-section">
        <div className="section-heading">
          <h2>Todo lo que necesitas para crecer</h2>
          <p>Una plataforma pensada para emprendedores, startups e inversores.</p>
        </div>
        <div className="features-grid" ref={featGrid.ref}>
          {[
            { Icon: ClipboardList, title: 'Perfil Profesional', text: 'Crea un perfil atractivo con tus productos, rubro y la historia de tu emprendimiento.' },
            { Icon: Video, title: 'Pitch en Video', text: 'Sube fotos y un video pitch que demuestre que tu negocio es 100% real.' },
            { Icon: Search, title: 'Explora el Marketplace', text: 'Encuentra emprendimientos, startups e inversores por rubro o nombre.' },
            { Icon: GraduationCap, title: 'Academia StarU', text: 'Aprende a crecer tu empresa y a dominar el comercio digital.' },
            { Icon: MessagesSquare, title: 'Comunidad', text: 'Foros para resolver dudas, compartir experiencias y buscar socios.' },
            { Icon: CalendarDays, title: 'Convocatorias', text: 'Concursos, ruedas de negocio, webinars y aceleradoras en un calendario.' },
          ].map((f, i) => (
            <div
              className={`feature-card reveal reveal-d${(i % 6) + 1} ${featGrid.shown ? 'reveal-in' : ''}`}
              key={f.title}
            >
              <div className="feature-icon">
                <f.Icon size={26} strokeWidth={2} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={cta.ref}
        className={`container landing-cta-band reveal ${cta.shown ? 'reveal-in' : ''}`}
      >
        <h2>¿Listo para hacer despegar tu idea?</h2>
        <p>Únete a StarU y conecta con el ecosistema emprendedor.</p>
        <Button asChild variant="gradient" size="lg">
          <Link to="/registro">Crear mi perfil gratis</Link>
        </Button>
      </section>
    </div>
  )
}
