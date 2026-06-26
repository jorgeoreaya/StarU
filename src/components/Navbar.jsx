import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '@/components/ui/button'
import logo from '../assets/staru-logo.jpeg'
import './Navbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/explorar', label: 'Explorar' },
  { to: '/academia', label: 'Academia' },
  { to: '/comunidad', label: 'Comunidad' },
  { to: '/convocatorias', label: 'Convocatorias' },
]

function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          <img src={logo} alt="StarU" className="logo-img" />
          <span className="logo-text">
            Star<span className="text-gradient">U</span>
          </span>
        </Link>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="user-menu">
              <Link to="/mi-perfil" className="user-chip" onClick={() => setOpen(false)}>
                <span
                  className="user-avatar-small"
                  style={
                    profile?.avatar_url
                      ? { backgroundImage: `url(${profile.avatar_url})` }
                      : undefined
                  }
                >
                  {!profile?.avatar_url && initials(profile?.full_name)}
                </span>
                <span className="user-name-nav" title={profile?.full_name || 'Mi perfil'}>
                  {profile?.full_name || 'Mi perfil'}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Salir
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild variant="gradient" size="sm">
                <Link to="/registro">Registrarse</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="nav-toggle"
          aria-label="Abrir menú"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
