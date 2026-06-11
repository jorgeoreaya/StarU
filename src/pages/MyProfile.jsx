import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { supabase, uploadFile, BUCKETS } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ProfileDetail from '../components/ProfileDetail'
import MediaUploader from '../components/MediaUploader'
import { RUBROS, EXPERIENCE_OPTIONS, INVESTOR_TYPES, INTEREST_SECTORS } from '../lib/constants'
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
import '../components/ProfileDetail.css'
import '../pages/Auth.css'

export default function MyProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [productDraft, setProductDraft] = useState({ name: '', price: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [pitchFile, setPitchFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const isFounder = profile?.role === 'emprendimiento'

  useEffect(() => {
    if (!user) return
    async function loadProducts() {
      const { data } = await supabase.from('products').select('*').eq('profile_id', user.id)
      setProducts(data ?? [])
    }
    loadProducts()
  }, [user])

  const startEdit = () => {
    setForm({
      full_name: profile.full_name || '',
      city: profile.city || '',
      business_name: profile.business_name || '',
      rubro: profile.rubro || '',
      experience: profile.experience || '',
      description: profile.description || '',
      company: profile.company || '',
      investor_type: profile.investor_type || '',
      interests: profile.interests || [],
      bio: profile.bio || '',
    })
    setAvatarFile(null)
    setPitchFile(null)
    setEditing(true)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const toggleInterest = (sector) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(sector)
        ? f.interests.filter((s) => s !== sector)
        : [...f.interests, sector],
    }))
  }

  const addProduct = async () => {
    if (!productDraft.name.trim()) return
    const { data, error } = await supabase
      .from('products')
      .insert({ profile_id: user.id, name: productDraft.name, price: productDraft.price })
      .select()
      .single()
    if (error) {
      toast('No se pudo agregar el producto', 'error')
      return
    }
    setProducts((p) => [...p, data])
    setProductDraft({ name: '', price: '' })
  }

  const removeProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts((p) => p.filter((x) => x.id !== id))
  }

  const save = async () => {
    setSaving(true)
    try {
      let avatar_url = profile.avatar_url
      let pitch_video_url = profile.pitch_video_url
      if (avatarFile) avatar_url = await uploadFile(BUCKETS.avatars, avatarFile, user.id)
      if (isFounder && pitchFile)
        pitch_video_url = await uploadFile(BUCKETS.pitches, pitchFile, user.id)

      const patch = isFounder
        ? {
            full_name: form.full_name,
            city: form.city,
            business_name: form.business_name,
            rubro: form.rubro,
            experience: form.experience,
            description: form.description,
            avatar_url,
            pitch_video_url,
          }
        : {
            full_name: form.full_name,
            city: form.city,
            company: form.company,
            investor_type: form.investor_type,
            interests: form.interests,
            bio: form.bio,
            avatar_url,
          }

      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast('Perfil actualizado', 'success')
      setEditing(false)
    } catch (err) {
      toast('Error al guardar: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="page profile-page">
        <div className="container">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="page profile-page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem' }}>Mi perfil</h1>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil size={15} /> Editar perfil
            </Button>
          )}
        </div>

        {!editing ? (
          <ProfileDetail profile={profile} products={products} />
        ) : (
          <div className="auth-card auth-card-wide">
            <div className="edit-card-header">
              <h2>Editar perfil</h2>
              <p>Actualiza tu información para que otros te conozcan mejor.</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <Label>Nombre completo</Label>
                <Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
              </div>
              <div className="form-group">
                <Label>Ciudad</Label>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>

              {isFounder ? (
                <>
                  <div className="form-group full-width">
                    <Label>Nombre del negocio</Label>
                    <Input
                      value={form.business_name}
                      onChange={(e) => set('business_name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Rubro</Label>
                    <Select value={form.rubro} onValueChange={(v) => set('rubro', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona…" />
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
                    <Label>Descripción</Label>
                    <Textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Foto / logo</Label>
                    <MediaUploader
                      accept="image/*"
                      type="image"
                      label="Cambiar imagen"
                      initialUrl={profile.avatar_url}
                      onSelect={setAvatarFile}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Video pitch</Label>
                    <MediaUploader
                      accept="video/*"
                      type="video"
                      label="Cambiar video"
                      initialUrl={profile.pitch_video_url}
                      onSelect={setPitchFile}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group full-width">
                    <Label>Empresa u organización</Label>
                    <Input value={form.company} onChange={(e) => set('company', e.target.value)} />
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
                      label="Cambiar imagen"
                      initialUrl={profile.avatar_url}
                      onSelect={setAvatarFile}
                    />
                  </div>
                  <div className="form-group full-width">
                    <Label>Biografía</Label>
                    <Textarea rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
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
                </>
              )}
            </div>

            {/* Productos (solo fundadores) */}
            {isFounder && (
              <div className="form-group full-width mt-2">
                <Label>Productos y servicios</Label>
                <div className="product-input-row">
                  <Input
                    placeholder="Nombre"
                    value={productDraft.name}
                    onChange={(e) => setProductDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Precio (Bs.)"
                    value={productDraft.price}
                    onChange={(e) => setProductDraft((d) => ({ ...d, price: e.target.value }))}
                  />
                  <Button variant="gradient" size="sm" onClick={addProduct}>
                    + Agregar
                  </Button>
                </div>
                <div className="products-list">
                  {products.map((p) => (
                    <div className="product-chip" key={p.id}>
                      <span>
                        {p.name}
                        {p.price && ` · Bs. ${p.price}`}
                      </span>
                      <button onClick={() => removeProduct(p.id)} aria-label="Quitar">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
