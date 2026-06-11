import { useEffect, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useReveal } from '@/lib/useReveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import './Sections.css'

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ThreadCard({ thread, index, onOpen }) {
  const { ref, shown } = useReveal()
  const author = thread.author?.full_name || 'Usuario'
  const count = thread.reply_count ?? thread.replies_count ?? 0
  const delay = `reveal-d${(index % 6) + 1}`
  return (
    <button
      ref={ref}
      className={`thread-card reveal ${delay} ${shown ? 'reveal-in' : ''}`}
      onClick={() => onOpen(thread)}
    >
      <span className="thread-card__avatar" aria-hidden="true">
        {author.trim().charAt(0).toUpperCase()}
      </span>
      <div className="thread-card__main">
        <h3>{thread.title}</h3>
        <p>{thread.body}</p>
        <span className="thread-card__by">
          <b>{author}</b> · {timeAgo(thread.created_at)}
        </span>
      </div>
      <div className="thread-card__count">
        <span className="thread-card__num">{count}</span>
        <span className="thread-card__label">
          {count === 1 ? 'respuesta' : 'respuestas'}
        </span>
      </div>
    </button>
  )
}

export default function Comunidad() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [openThread, setOpenThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const head = useReveal()

  const loadThreads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('community_threads')
      .select('*, author:profiles(full_name, role)')
      .order('created_at', { ascending: false })
    setThreads(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadThreads()
  }, [])

  const createThread = async () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast('Completa título y mensaje', 'error')
      return
    }
    const { error } = await supabase
      .from('community_threads')
      .insert({ author_id: user.id, title: draft.title, body: draft.body })
    if (error) {
      toast('Error: ' + error.message, 'error')
      return
    }
    toast('Hilo publicado', 'success')
    setDraft({ title: '', body: '' })
    setShowForm(false)
    loadThreads()
  }

  const openThreadDetail = async (thread) => {
    setOpenThread(thread)
    const { data } = await supabase
      .from('community_replies')
      .select('*, author:profiles(full_name)')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })
    setReplies(data ?? [])
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    const { data, error } = await supabase
      .from('community_replies')
      .insert({ thread_id: openThread.id, author_id: user.id, body: replyText })
      .select('*, author:profiles(full_name)')
      .single()
    if (error) {
      toast('Error: ' + error.message, 'error')
      return
    }
    setReplies((r) => [...r, data])
    setReplyText('')
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
              <span className="text-gradient">Comunidad</span> StarU
            </h1>
            <p>Haz preguntas, comparte experiencias y encuentra socios estratégicos</p>
          </div>
          {user ? (
            <div className="section-head__action">
              <Button variant="gradient" onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Cerrar' : '+ Nuevo hilo'}
              </Button>
            </div>
          ) : null}
        </div>

        {!user && (
          <p className="section-note">Inicia sesión para participar en los foros.</p>
        )}

        {showForm && (
          <div className="card section-form section-form--accent">
            <span className="section-form__hint">Nuevo hilo</span>
            <div className="form-group">
              <Label>Título</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="¿Sobre qué quieres conversar?"
              />
            </div>
            <div className="form-group">
              <Label>Mensaje</Label>
              <Textarea
                rows={4}
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                placeholder="Cuéntale a la comunidad…"
              />
            </div>
            <Button variant="gradient" onClick={createThread}>
              Publicar hilo
            </Button>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : threads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><MessagesSquare size={48} /></div>
            <h3>No hay hilos todavía</h3>
            <p>Inicia la primera conversación de la comunidad.</p>
          </div>
        ) : (
          <div className="section-list thread-list">
            {threads.map((t, i) => (
              <ThreadCard key={t.id} thread={t} index={i} onOpen={openThreadDetail} />
            ))}
          </div>
        )}

        {/* Modal de hilo */}
        <Dialog open={!!openThread} onOpenChange={(o) => !o && setOpenThread(null)}>
          {openThread && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{openThread.title}</DialogTitle>
              </DialogHeader>
              <p className="thread-original">{openThread.body}</p>
              <span className="thread-author-line">
                — {openThread.author?.full_name || 'Usuario'}
              </span>

              <div className="replies">
                <h4>Respuestas ({replies.length})</h4>
                {replies.map((r) => (
                  <div className="reply" key={r.id}>
                    <strong>{r.author?.full_name || 'Usuario'}</strong>
                    <p>{r.body}</p>
                  </div>
                ))}
                {replies.length === 0 && <p className="section-note">Sé el primero en responder.</p>}
              </div>

              {user ? (
                <div className="reply-box">
                  <Textarea
                    rows={2}
                    placeholder="Escribe una respuesta…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button size="sm" variant="gradient" onClick={sendReply}>
                    Responder
                  </Button>
                </div>
              ) : (
                <p className="section-note">Inicia sesión para responder.</p>
              )}
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  )
}
