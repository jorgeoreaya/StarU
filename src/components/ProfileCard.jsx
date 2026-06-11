import { Link } from 'react-router-dom'
import { MapPin, Play, ArrowRight } from 'lucide-react'
import { ROLE_LABELS } from '../lib/constants'
import { getRoleIcon, getRubroIcon } from '../lib/icons'

function initials(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export default function ProfileCard({ profile }) {
  const isFounder = profile.role === 'emprendimiento'
  const title = isFounder ? profile.business_name || profile.full_name : profile.full_name
  const subtitle = isFounder
    ? profile.rubro || ROLE_LABELS[profile.role]
    : profile.investor_type || 'Inversor'
  const RoleIcon = getRoleIcon(profile.role)
  const RubroIcon = isFounder ? getRubroIcon(profile.rubro) : null

  return (
    <Link to={`/perfil/${profile.id}`} className="profile-card">
      <div className="profile-card-media">
        {isFounder && profile.pitch_video_url ? (
          <video
            src={profile.pitch_video_url}
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
              e.currentTarget.currentTime = 0
            }}
          />
        ) : profile.avatar_url ? (
          <img src={profile.avatar_url} alt={title || 'Perfil'} />
        ) : (
          <div className="profile-card-placeholder">{initials(title)}</div>
        )}
        <span className={`pill pill-${profile.role} profile-card-role`}>
          {RoleIcon && <RoleIcon size={13} />} {ROLE_LABELS[profile.role]}
        </span>
        {isFounder && profile.pitch_video_url && (
          <span className="profile-card-playhint">
            <Play size={12} /> Pitch
          </span>
        )}
      </div>

      <div className="profile-card-body">
        <div className="profile-card-identity">
          <div className="profile-card-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              initials(title)
            )}
          </div>
          <div className="profile-card-identity-text">
            <h3 title={title || 'Sin nombre'}>{title || 'Sin nombre'}</h3>
            <span className="profile-card-subtitle icon-inline" title={subtitle}>
              {RubroIcon && <RubroIcon size={14} />} {subtitle}
            </span>
          </div>
        </div>
        <p className="profile-card-desc">
          {isFounder
            ? profile.description || 'Sin descripción todavía.'
            : profile.bio || 'Inversor en StarU.'}
        </p>
      </div>

      <div className="profile-card-footer">
        <span className="profile-card-city icon-inline">
          <MapPin size={13} /> {profile.city || 'Sin ubicación'}
        </span>
        <span className="profile-card-cta">
          Ver perfil <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}
