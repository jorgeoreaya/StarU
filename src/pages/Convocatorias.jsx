import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, ArrowRight, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useReveal } from '@/lib/useReveal'
import { EVENT_TYPES } from '../lib/constants'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import './Sections.css'

function formatDate(dateStr) {
  if (!dateStr) return 'Fecha por confirmar'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

const EMPTY = { title: '', description: '', event_type: '', event_date: '', location: '', url: '' }

function EventCard({ ev, index, onOpen }) {
  const { ref, shown } = useReveal()
  const delay = `reveal-d${(index % 6) + 1}`
  return (
    <div
      ref={ref}
      className={`event-card reveal ${delay} ${shown ? 'reveal-in' : ''}`}
    >
      <div className="event-card__date">
        <span className="event-card__day">
          {ev.event_date ? new Date(ev.event_date + 'T00:00:00').getDate() : '—'}
        </span>
        <span className="event-card__month">
          {ev.event_date
            ? new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es', { month: 'short' })
            : ''}
        </span>
      </div>
      <div className="event-card__body">
        <div className="flex-gap">
          {ev.event_type && <span className="badge">{ev.event_type}</span>}
        </div>
        <h3>{ev.title}</h3>
        {ev.description && <p>{ev.description}</p>}
        <div className="event-card__meta">
          <span className="icon-inline"><CalendarDays size={14} /> {formatDate(ev.event_date)}</span>
          {ev.location && <span className="icon-inline"><MapPin size={14} /> {ev.location}</span>}
        </div>
      </div>
      <div className="event-card__cta">
        <Button variant="outline" size="sm" onClick={() => onOpen(ev)}>
          Ver más <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  )
}

export default function Convocatorias() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [openEvent, setOpenEvent] = useState(null)
  const head = useReveal()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('convocatorias')
      .select('*')
      .order('event_date', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    if (!draft.title.trim()) {
      toast('El título es obligatorio', 'error')
      return
    }
    setSaving(true)
    const payload = { ...draft, author_id: user.id, event_date: draft.event_date || null }
    const { error } = await supabase.from('convocatorias').insert(payload)
    setSaving(false)
    if (error) {
      toast('Error: ' + error.message, 'error')
      return
    }
    toast('Convocatoria publicada', 'success')
    setDraft(EMPTY)
    setShowForm(false)
    load()
  }

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <div className="page">
      <div className="container">
        <div
          ref={head.ref}
          className={`section-head reveal ${head.shown ? 'reveal-in' : ''}`}
        >
          <div className="section-head__text">
            <h1>
              <span className="text-gradient">Convocatorias</span> y eventos
            </h1>
            <p>Concursos, ruedas de negocio, webinars, capacitaciones e incubadoras</p>
          </div>
          {user && (
            <div className="section-head__action">
              <Button variant="gradient" onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Cerrar' : '+ Publicar convocatoria'}
              </Button>
            </div>
          )}
        </div>

        {showForm && (
          <div className="card section-form section-form--accent">
            <span className="section-form__hint">Nueva convocatoria</span>
            <div className="form-grid">
              <div className="form-group full-width">
                <Label>Título</Label>
                <Input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej: Concurso Nacional de Startups 2026" />
              </div>
              <div className="form-group">
                <Label>Tipo de evento</Label>
                <Select value={draft.event_type} onValueChange={(v) => set('event_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="form-group">
                <Label>Fecha</Label>
                <Input type="date" value={draft.event_date} onChange={(e) => set('event_date', e.target.value)} />
              </div>
              <div className="form-group">
                <Label>Lugar</Label>
                <Input value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej: Santa Cruz / Virtual" />
              </div>
              <div className="form-group">
                <Label>Enlace (opcional)</Label>
                <Input value={draft.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" />
              </div>
              <div className="form-group full-width">
                <Label>Descripción</Label>
                <Textarea rows={3} value={draft.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>
            <Button variant="gradient" onClick={submit} disabled={saving}>
              {saving ? 'Publicando…' : 'Publicar convocatoria'}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><CalendarDays size={48} /></div>
            <h3>No hay convocatorias activas</h3>
            <p>Vuelve pronto o publica la primera.</p>
          </div>
        ) : (
          <div className="section-list events-list">
            {events.map((ev, i) => (
              <EventCard key={ev.id} ev={ev} index={i} onOpen={setOpenEvent} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!openEvent} onOpenChange={(o) => !o && setOpenEvent(null)}>
        <DialogContent>
          {openEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{openEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="event-detail">
                <div className="flex-gap">
                  {openEvent.event_type && <span className="badge">{openEvent.event_type}</span>}
                </div>
                <div className="event-detail__meta">
                  <span className="icon-inline"><CalendarDays size={15} /> {formatDate(openEvent.event_date)}</span>
                  {openEvent.location && (
                    <span className="icon-inline"><MapPin size={15} /> {openEvent.location}</span>
                  )}
                </div>
                {openEvent.description && (
                  <p className="event-detail__desc">{openEvent.description}</p>
                )}
                {openEvent.url && (
                  <Button asChild variant="gradient">
                    <a href={openEvent.url} target="_blank" rel="noreferrer">
                      Ir al sitio <ExternalLink size={15} />
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
