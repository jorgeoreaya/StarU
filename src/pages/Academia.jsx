import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { supabase, uploadFile, BUCKETS } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useReveal } from '@/lib/useReveal'
import MediaUploader from '../components/MediaUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import './Sections.css'

function PostCard({ post, index }) {
  const { ref, shown } = useReveal()
  const author = post.author?.full_name || 'StarU'
  const delay = `reveal-d${(index % 6) + 1}`
  return (
    <article
      ref={ref}
      className={`post-card reveal ${delay} ${shown ? 'reveal-in' : ''}`}
    >
      {post.cover_url ? (
        <img src={post.cover_url} alt={post.title} className="post-card__cover" />
      ) : (
        <div className="post-card__cover post-card__cover--placeholder">
          <GraduationCap size={44} />
        </div>
      )}
      <div className="post-card__body">
        <span className="post-tag">Guía</span>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.content}</p>
        <div className="post-card__footer">
          <span className="post-card__avatar" aria-hidden="true">
            {author.trim().charAt(0).toUpperCase()}
          </span>
          <span className="post-card__author">
            <b>{author}</b>
            <span>Autor</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default function Academia() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ title: '', content: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const head = useReveal()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('academia_posts')
      .select('*, author:profiles(full_name)')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast('Completa título y contenido', 'error')
      return
    }
    setSaving(true)
    try {
      let cover_url = null
      if (coverFile) cover_url = await uploadFile(BUCKETS.academia, coverFile, user.id)
      const { error } = await supabase.from('academia_posts').insert({
        author_id: user.id,
        title: draft.title,
        content: draft.content,
        cover_url,
      })
      if (error) throw error
      toast('Contenido publicado', 'success')
      setDraft({ title: '', content: '' })
      setCoverFile(null)
      setShowForm(false)
      load()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div
          ref={head.ref}
          className={`section-head reveal ${head.shown ? 'reveal-in' : ''}`}
        >
          <div className="section-head__text">
            <h1>
              Academia <span className="text-gradient">StarU</span>
            </h1>
            <p>Guías y contenido para hacer crecer tu emprendimiento en el mundo digital</p>
          </div>
          {user && (
            <div className="section-head__action">
              <Button variant="gradient" onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Cerrar' : '+ Publicar contenido'}
              </Button>
            </div>
          )}
        </div>

        {showForm && (
          <div className="card section-form section-form--accent">
            <span className="section-form__hint">Nuevo contenido</span>
            <div className="form-group">
              <Label>Título</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Ej: 5 pasos para validar tu idea de negocio"
              />
            </div>
            <div className="form-group">
              <Label>Contenido</Label>
              <Textarea
                rows={6}
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="Escribe tu guía o artículo…"
              />
            </div>
            <div className="form-group">
              <Label>Imagen de portada (opcional)</Label>
              <MediaUploader accept="image/*" type="image" label="Subir portada" onSelect={setCoverFile} />
            </div>
            <Button variant="gradient" onClick={submit} disabled={saving}>
              {saving ? 'Publicando…' : 'Publicar'}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><GraduationCap size={48} /></div>
            <h3>Aún no hay contenido</h3>
            <p>{user ? 'Sé el primero en compartir una guía.' : 'Inicia sesión para publicar contenido.'}</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
