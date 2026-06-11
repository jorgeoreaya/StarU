import { MapPin, Video, User } from 'lucide-react'
import { ROLE_LABELS } from '../lib/constants'
import { getRoleIcon } from '../lib/icons'
import { useReveal } from '@/lib/useReveal'
import './ProfileDetail.css'

function initials(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

// Sección que se revela al entrar en viewport.
function RevealSection({ children, className = '', delay = '' }) {
  const { ref, shown } = useReveal()
  return (
    <section
      ref={ref}
      className={`profile-section reveal ${delay} ${shown ? 'reveal-in' : ''} ${className}`}
    >
      {children}
    </section>
  )
}

// Vista de solo lectura de un perfil + sus productos.
export default function ProfileDetail({ profile, products = [] }) {
  const isFounder = profile.role === 'emprendimiento'
  const title = isFounder ? profile.business_name || profile.full_name : profile.full_name
  const RoleIcon = getRoleIcon(profile.role)
  const aside = useReveal()

  return (
    <div className="profile-detail">
      {/* ---------- Columna izquierda: identidad (sticky en desktop) ---------- */}
      <aside
        ref={aside.ref}
        className={`profile-aside reveal ${aside.shown ? 'reveal-in' : ''}`}
      >
        <div className="profile-aside-inner">
          <div className="profile-detail-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={title} />
            ) : (
              initials(title)
            )}
          </div>
          <span className={`pill pill-${profile.role} profile-aside-role`}>
            {RoleIcon && <RoleIcon size={14} />} {ROLE_LABELS[profile.role]}
          </span>
          <h1>{title || 'Sin nombre'}</h1>
          {isFounder ? (
            <p className="profile-detail-sub">
              {profile.rubro && <span>{profile.rubro}</span>}
              {profile.experience && <span> · {profile.experience}</span>}
            </p>
          ) : (
            <p className="profile-detail-sub">
              {profile.investor_type}
              {profile.company && ` · ${profile.company}`}
            </p>
          )}
          <div className="profile-aside-meta">
            {profile.full_name && isFounder && (
              <p className="profile-detail-owner icon-inline">
                <User size={14} /> Fundador/a: {profile.full_name}
              </p>
            )}
            {profile.city && (
              <p className="profile-detail-city icon-inline">
                <MapPin size={14} /> {profile.city}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ---------- Columna derecha: contenido ---------- */}
      <div className="profile-main">
        {isFounder ? (
          <>
            {profile.description && (
              <RevealSection delay="reveal-d1">
                <h3>Sobre el emprendimiento</h3>
                <p>{profile.description}</p>
              </RevealSection>
            )}

            {profile.pitch_video_url && (
              <RevealSection delay="reveal-d2">
                <h3 className="icon-text">
                  <Video size={20} /> Video pitch
                </h3>
                <video src={profile.pitch_video_url} controls className="profile-pitch" />
              </RevealSection>
            )}

            {products.length > 0 && (
              <RevealSection delay="reveal-d3">
                <h3>Productos y servicios</h3>
                <div className="products-grid">
                  {products.map((p) => (
                    <div className="product-card" key={p.id ?? p.name}>
                      <span className="product-card-name">{p.name}</span>
                      {p.price && <span className="product-card-price">Bs. {p.price}</span>}
                    </div>
                  ))}
                </div>
              </RevealSection>
            )}
          </>
        ) : (
          <>
            {profile.bio && (
              <RevealSection delay="reveal-d1">
                <h3>Biografía</h3>
                <p>{profile.bio}</p>
              </RevealSection>
            )}
            {profile.interests?.length > 0 && (
              <RevealSection delay="reveal-d2">
                <h3>Sectores de interés</h3>
                <div className="flex-gap">
                  {profile.interests.map((s) => (
                    <span className="pill pill-inversor" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </RevealSection>
            )}
          </>
        )}
      </div>
    </div>
  )
}
