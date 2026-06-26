import { Link } from 'react-router-dom'
import logo from '../assets/staru-logo.jpeg'
import './Footer.css'

// Iconos SVG en línea (la versión de lucide-react instalada no incluye estas marcas).
function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function TikTokIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3h-2.6v13.1a2.4 2.4 0 1 1-2.4-2.4c.16 0 .31.02.46.05v-2.66a5.06 5.06 0 1 0 4.54 5.03V8.94a6.27 6.27 0 0 0 3.6 1.15V7.43a3.66 3.66 0 0 1-3.6-3.6V3z" />
    </svg>
  )
}

function YouTubeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7.5a3 3 0 0 0-2.1-2.12C19.1 4.9 12 4.9 12 4.9s-7.1 0-8.9.48A3 3 0 0 0 1 7.5 31.3 31.3 0 0 0 .5 12 31.3 31.3 0 0 0 1 16.5a3 3 0 0 0 2.1 2.12c1.8.48 8.9.48 8.9.48s7.1 0 8.9-.48A3 3 0 0 0 23 16.5 31.3 31.3 0 0 0 23.5 12 31.3 31.3 0 0 0 23 7.5zM9.75 15.4V8.6l6 3.4-6 3.4z" />
    </svg>
  )
}

function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}

const SOCIALS = [
  { name: 'Instagram', handle: '@staru_bolivia', href: 'https://www.instagram.com/staru_bolivia', Icon: InstagramIcon },
  { name: 'TikTok', handle: '@staru_bolivia', href: 'https://www.tiktok.com/@staru_bolivia', Icon: TikTokIcon },
  { name: 'YouTube', handle: '@staru_bolivia', href: 'https://youtube.com/@staru_bolivia', Icon: YouTubeIcon },
  { name: 'Facebook', handle: 'StarU Bolivia', href: 'https://www.facebook.com/share/1B8iSuVVmR/', Icon: FacebookIcon },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <img src={logo} alt="StarU" className="site-footer-logo-img" />
            <span>Star<span className="text-gradient">U</span></span>
          </Link>
          <p>Conectamos ideas con el capital que las hace realidad.</p>
        </div>

        <div className="site-footer-social">
          <span className="site-footer-social-label">Síguenos</span>
          <div className="site-footer-social-links">
            {SOCIALS.map(({ name, handle, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-social-link"
                aria-label={`${name} de StarU`}
                title={`${name} · ${handle}`}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} StarU. Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}
