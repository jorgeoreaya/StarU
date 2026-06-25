import { Link } from 'react-router-dom'
import './Footer.css'

// Icono de Instagram en SVG (la versión de lucide-react instalada no lo incluye).
function InstagramIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            Star<span className="text-gradient">U</span>
          </Link>
          <p>Conectamos ideas con el capital que las hace realidad.</p>
        </div>

        <div className="site-footer-social">
          <span className="site-footer-social-label">Síguenos</span>
          <a
            href="https://www.instagram.com/staruplatform"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-social-link"
            aria-label="Instagram de StarU"
          >
            <InstagramIcon size={20} />
            <span>@staruplatform</span>
          </a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} StarU. Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}
