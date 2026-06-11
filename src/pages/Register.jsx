import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Briefcase, ArrowLeft, ArrowRight, X, PartyPopper, MapPin, Building2, Check } from 'lucide-react'
import { supabase, uploadFile, BUCKETS } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { useReveal } from '@/lib/useReveal'
import MediaUploader from '../components/MediaUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RUBROS,
  EXPERIENCE_OPTIONS,
  INVESTOR_TYPES,
  INTEREST_SECTORS,
} from '../lib/constants'
import './Auth.css'

const EMPTY = {
  // básicos
  full_name: '',
  email: '',
  password: '',
  city: '',
  // emprendimiento
  business_name: '',
  rubro: '',
  experience: '',
  description: '',
  // inversor
  company: '',
  investor_type: '',
  interests: [],
  bio: '',
}

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState(null) // 'emprendimiento' | 'inversor'
  const [form, setForm] = useState(EMPTY)
  const [products, setProducts] = useState([])
  const [productDraft, setProductDraft] = useState({ name: '', price: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [pitchFile, setPitchFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const role1 = useReveal()
  const role3 = useReveal()

  const isFounder = role === 'emprendimiento'
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const selectRole = (r) => {
    setRole(r)
    setStep(2)
  }

  const validateBasic = () => {
    if (!form.full_name || !form.email || !form.password) {
      toast('Completa nombre, correo y contraseña', 'error')
      return false
    }
    if (form.password.length < 6) {
      toast('La contraseña debe tener al menos 6 caracteres', 'error')
      return false
    }
    return true
  }

  const addProduct = () => {
    if (!productDraft.name.trim()) return
    setProducts((p) => [...p, { ...productDraft }])
    setProductDraft({ name: '', price: '' })
  }

  const removeProduct = (i) => setProducts((p) => p.filter((_, idx) => idx !== i))

  const toggleInterest = (sector) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(sector)
        ? f.interests.filter((s) => s !== sector)
        : [...f.interests, sector],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 1. Crear usuario en Auth con metadata (el trigger crea la fila base).
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { role, full_name: form.full_name, city: form.city },
        },
      })
      if (signUpError) throw signUpError

      const userId = signUpData.user?.id
      if (!userId) throw new Error('No se pudo crear el usuario.')

      // 2. Subir medios (si hay sesión activa; signUp inicia sesión salvo confirmación por email).
      let avatar_url = null
      let pitch_video_url = null
      if (signUpData.session) {
        if (avatarFile) avatar_url = await uploadFile(BUCKETS.avatars, avatarFile, userId)
        if (isFounder && pitchFile)
          pitch_video_url = await uploadFile(BUCKETS.pitches, pitchFile, userId)
      }

      // 3. Completar el perfil.
      const profilePatch = isFounder
        ? {
            business_name: form.business_name,
            rubro: form.rubro,
            experience: form.experience,
            description: form.description,
            avatar_url,
            pitch_video_url,
          }
        : {
            company: form.company,
            investor_type: form.investor_type,
            interests: form.interests,
            bio: form.bio,
            avatar_url,
          }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: form.full_name, city: form.city, ...profilePatch })
        .eq('id', userId)
      if (updateError) throw updateError

      // 4. Insertar productos del emprendimiento.
      if (isFounder && products.length) {
        const rows = products.map((p) => ({
          profile_id: userId,
          name: p.name,
          price: p.price,
        }))
        const { error: productsError } = await supabase.from('products').insert(rows)
        // No abortamos el registro si fallan los productos: el perfil ya existe.
        if (productsError) {
          toast('Tu perfil se creó, pero no pudimos guardar los productos. Agrégalos desde tu perfil.', 'info')
        }
      }

      if (signUpData.session) {
        toast('¡Tu perfil fue publicado!', 'success')
        navigate('/mi-perfil')
      } else {
        toast('Revisa tu correo para confirmar tu cuenta.', 'info')
        navigate('/login')
      }
    } catch (err) {
      toast('Error al registrar: ' + err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="auth-card auth-card-wide">
          <div className="auth-header">
            <h1>
              Crea tu cuenta en <span className="text-gradient">StarU</span>
            </h1>
            <p>Elige tu tipo de perfil y comienza a conectar</p>
          </div>

          {/* Paso 1: Rol */}
          {step === 1 && (
            <div key="step-1" className="step-content">
              <h3 className="step-title">¿Cómo quieres participar?</h3>
              <p className="step-subtitle">Elige el perfil que mejor te describe</p>
              <div className="role-selector">
                <button ref={role1.ref} className={`role-card role-emprendimiento reveal reveal-d1 ${role1.shown ? 'reveal-in' : ''}`} onClick={() => selectRole('emprendimiento')}>
                  <span className="role-card-accent" aria-hidden="true" />
                  <div className="role-badge"><Rocket size={30} /></div>
                  <h4>Emprendimiento / Startup</h4>
                  <p>Tengo un negocio o proyecto que quiero mostrar y hacer crecer.</p>
                  <ul className="role-features">
                    <Feature>Perfil con productos</Feature>
                    <Feature>Fotos y video pitch</Feature>
                    <Feature>Conecta con inversores</Feature>
                  </ul>
                  <span className="role-card-cta icon-inline">Elegir <ArrowRight size={15} /></span>
                </button>
                <button ref={role3.ref} className={`role-card role-inversor reveal reveal-d2 ${role3.shown ? 'reveal-in' : ''}`} onClick={() => selectRole('inversor')}>
                  <span className="role-card-accent" aria-hidden="true" />
                  <div className="role-badge"><Briefcase size={30} /></div>
                  <h4>Inversor</h4>
                  <p>Busco oportunidades de inversión en proyectos prometedores.</p>
                  <ul className="role-features">
                    <Feature>Perfil profesional</Feature>
                    <Feature>Explora emprendimientos</Feature>
                    <Feature>Conecta con fundadores</Feature>
                  </ul>
                  <span className="role-card-cta icon-inline">Elegir <ArrowRight size={15} /></span>
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Datos básicos */}
          {step === 2 && (
            <div key="step-2" className="step-content">
              <StepProgress step={2} />
              <h3 className="step-title">Información básica</h3>
              <p className="step-subtitle">Tus credenciales y dónde te ubicas</p>
              <div className="form-grid">
                <div className="form-group">
                  <Label>Nombre completo</Label>
                  <Input
                    type="text"
                    placeholder="Ej: María López"
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label>Correo electrónico</Label>
                  <Input
                    type="email"
                    placeholder="maria@ejemplo.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label>Ciudad</Label>
                  <Input
                    type="text"
                    placeholder="Ej: Santa Cruz"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Atrás
                </Button>
                <Button variant="gradient" onClick={() => validateBasic() && setStep(3)}>
                  Siguiente <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Detalles del perfil según rol */}
          {step === 3 && (
            <div key="step-3" className="step-content">
              <StepProgress step={3} />
              {isFounder ? (
                <>
                  <h3 className="step-title icon-text">
                    <Rocket size={20} />
                    Tu emprendimiento
                  </h3>
                  <div className="form-grid">
                    <div className="form-section-head full-width">
                      <span>Datos del negocio</span>
                    </div>
                    <div className="form-group full-width">
                      <Label>Nombre del negocio</Label>
                      <Input
                        type="text"
                        placeholder="Ej: Delicias de María"
                        value={form.business_name}
                        onChange={(e) => set('business_name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <Label>Rubro</Label>
                      <Select value={form.rubro} onValueChange={(v) => set('rubro', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rubro…" />
                        </SelectTrigger>
                        <SelectContent>
                          {RUBROS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group">
                      <Label>Tiempo en el negocio</Label>
                      <Select value={form.experience} onValueChange={(v) => set('experience', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_OPTIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group full-width">
                      <Label>Cuéntanos sobre tu emprendimiento</Label>
                      <Textarea
                        rows={4}
                        placeholder="¿Qué haces, qué problema resuelves y qué te hace especial?"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                      />
                    </div>

                    <div className="form-section-head full-width">
                      <span>Productos o servicios</span>
                    </div>
                    <div className="form-group full-width">
                      <Label>Productos o servicios</Label>
                      <div className="product-input-row">
                        <Input
                          type="text"
                          placeholder="Nombre del producto/servicio"
                          value={productDraft.name}
                          onChange={(e) =>
                            setProductDraft((d) => ({ ...d, name: e.target.value }))
                          }
                        />
                        <Input
                          type="text"
                          placeholder="Precio (Bs.)"
                          value={productDraft.price}
                          onChange={(e) =>
                            setProductDraft((d) => ({ ...d, price: e.target.value }))
                          }
                        />
                        <Button type="button" variant="gradient" size="sm" onClick={addProduct}>
                          + Agregar
                        </Button>
                      </div>
                      <div className="products-list">
                        {products.map((p, i) => (
                          <div className="product-chip" key={i}>
                            <span>
                              {p.name}
                              {p.price && ` · Bs. ${p.price}`}
                            </span>
                            <button onClick={() => removeProduct(i)} aria-label="Quitar">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-section-head full-width">
                      <span>Multimedia</span>
                    </div>
                    <div className="form-group">
                      <Label>Foto / logo</Label>
                      <MediaUploader
                        accept="image/*"
                        type="image"
                        label="Subir imagen"
                        hint="JPG o PNG."
                        onSelect={setAvatarFile}
                      />
                    </div>
                    <div className="form-group">
                      <Label>Video pitch</Label>
                      <MediaUploader
                        accept="video/*"
                        type="video"
                        label="Subir video"
                        hint="Muestra que tu negocio es real."
                        onSelect={setPitchFile}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="step-title icon-text">
                    <Briefcase size={20} /> Tu perfil de inversor
                  </h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <Label>Empresa u organización (opcional)</Label>
                      <Input
                        type="text"
                        placeholder="Ej: Capital Ventures Bolivia"
                        value={form.company}
                        onChange={(e) => set('company', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <Label>Tipo de inversor</Label>
                      <Select value={form.investor_type} onValueChange={(v) => set('investor_type', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVESTOR_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group">
                      <Label>Foto de perfil</Label>
                      <MediaUploader
                        accept="image/*"
                        type="image"
                        label="Subir imagen"
                        onSelect={setAvatarFile}
                      />
                    </div>
                    <div className="form-group full-width">
                      <Label>Sectores de interés</Label>
                      <div className="interest-tags">
                        {INTEREST_SECTORS.map((s) => (
                          <button
                            type="button"
                            key={s}
                            className={`interest-tag ${form.interests.includes(s) ? 'active' : ''}`}
                            onClick={() => toggleInterest(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <Label>Biografía profesional</Label>
                      <Textarea
                        rows={3}
                        placeholder="Tu experiencia y qué tipo de emprendimientos buscas apoyar…"
                        value={form.bio}
                        onChange={(e) => set('bio', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="form-actions">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Atrás
                </Button>
                <Button variant="gradient" onClick={() => setStep(4)}>
                  Siguiente <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 4: Preview */}
          {step === 4 && (
            <div key="step-4" className="step-content">
              <StepProgress step={4} />
              <h3 className="step-title">¡Tu perfil está listo!</h3>
              <p className="step-subtitle">Revisa cómo se verá antes de publicarlo</p>

              <div className="preview-shell">
                <div className="preview-card preview-card-profile">
                  <div className="preview-media">
                    {isFounder && pitchFile ? (
                      <video src={URL.createObjectURL(pitchFile)} muted loop playsInline className="preview-media-fill" />
                    ) : avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="" className="preview-media-fill" />
                    ) : (
                      <div className="preview-media-placeholder">
                        {(form.business_name || form.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`pill pill-${role} preview-media-role`}>
                      {role === 'inversor' ? 'Inversor' : 'Emprendimiento'}
                    </span>
                  </div>
                  <div className="preview-body">
                    <h4>{form.business_name || form.full_name || 'Tu nombre'}</h4>
                    <span className="preview-subtitle icon-inline">
                      {role === 'inversor'
                        ? form.investor_type || 'Inversor'
                        : form.rubro || 'Emprendimiento'}
                    </span>
                    {form.city && (
                      <span className="preview-city icon-inline">
                        <MapPin size={13} /> {form.city}
                      </span>
                    )}
                    {isFounder ? (
                      <>
                        {form.description && <p className="preview-text">{form.description}</p>}
                        {products.length > 0 && (
                          <div className="flex-gap">
                            {products.map((p, i) => (
                              <span className="product-chip" key={i}>
                                {p.name}
                                {p.price && ` · Bs. ${p.price}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {form.company && (
                          <p className="preview-text icon-inline">
                            <Building2 size={15} /> {form.company}
                          </p>
                        )}
                        {form.bio && <p className="preview-text">{form.bio}</p>}
                        {form.interests.length > 0 && (
                          <div className="flex-gap">
                            {form.interests.map((s) => (
                              <span className="pill pill-inversor" key={s}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft size={16} /> Editar
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    'Publicando…'
                  ) : (
                    <>
                      <PartyPopper size={18} /> Publicar mi perfil
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Feature({ children }) {
  return (
    <li className="icon-inline">
      <Check size={15} className="feature-check" /> {children}
    </li>
  )
}

function StepProgress({ step }) {
  const steps = [
    { n: 1, label: 'Rol' },
    { n: 2, label: 'Datos' },
    { n: 3, label: 'Perfil' },
    { n: 4, label: 'Listo' },
  ]
  return (
    <div className="step-progress" role="list" aria-label="Progreso del registro">
      {steps.map((s, i) => {
        const state = step === s.n ? 'active' : step > s.n ? 'completed' : 'upcoming'
        return (
          <div key={s.n} style={{ display: 'contents' }}>
            {i > 0 && <span className={`step-progress-line ${step > steps[i - 1].n ? 'filled' : ''}`} />}
            <div className={`step-progress-item ${state}`} role="listitem" aria-current={state === 'active' ? 'step' : undefined}>
              <span className="step-progress-marker">
                {state === 'completed' ? <Check size={15} /> : s.n}
              </span>
              <span className="step-progress-label">{s.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
