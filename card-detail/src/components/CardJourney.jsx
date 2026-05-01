import { useState } from 'react'
import s from './CardJourney.module.css'

const EVENT_TYPES = [
  { value: 'purchase',    label: 'Purchase',      color: 'var(--orange)' },
  { value: 'listed',      label: 'Listed',        color: 'var(--blue)'   },
  { value: 'price_drop',  label: 'Price Update',  color: 'var(--dim)'    },
  { value: 'sold',        label: 'Sold',          color: 'var(--green)'  },
  { value: 'graded',      label: 'Graded',        color: 'var(--purple)' },
  { value: 'note',        label: 'Note',          color: 'var(--faint)'  },
]

const fmt = n => n == null ? null : `$${Number(n).toFixed(2)}`

export default function CardJourney({ events: initialEvents }) {
  const [events, setEvents]     = useState(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ type: 'note', title: '', date: '', price: '', description: '' })

  function addEvent(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const typeInfo = EVENT_TYPES.find(t => t.value === form.type)
    setEvents(prev => [...prev.filter(e => !e.isPending), {
      id: Date.now(),
      type: form.type,
      title: form.title,
      date: form.date || 'Today',
      price: form.price ? parseFloat(form.price) : null,
      description: form.description,
      color: typeInfo?.color || 'var(--dim)',
    }])
    setForm({ type: 'note', title: '', date: '', price: '', description: '' })
    setShowForm(false)
  }

  return (
    <div className={`section-card ${s.journey}`}>
      <div className={s.header}>
        <div className="section-title" style={{ marginBottom: 0 }}>Card Journey</div>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Log Event'}
        </button>
      </div>

      {showForm && (
        <form className={s.form} onSubmit={addEvent}>
          <div className={s.formRow}>
            <label className={s.formLabel}>
              Type
              <select className={s.formCtrl} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className={s.formLabel} style={{ flex: 2 }}>
              Title *
              <input className={s.formCtrl} value={form.title} placeholder="e.g. Relisted at lower price"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </label>
          </div>
          <div className={s.formRow}>
            <label className={s.formLabel}>
              Date
              <input type="date" className={s.formCtrl} value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </label>
            <label className={s.formLabel}>
              Price ($)
              <input type="number" step="0.01" className={s.formCtrl} value={form.price} placeholder="Optional"
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </label>
            <label className={s.formLabel} style={{ flex: 2 }}>
              Note
              <input className={s.formCtrl} value={form.description} placeholder="Optional"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Add Event</button>
        </form>
      )}

      <div className={s.timeline}>
        {events.map((ev, i) => (
          <div key={ev.id} className={`${s.event} ${ev.isPending ? s.eventPending : ''}`}>
            {/* Vertical connector */}
            {i < events.length - 1 && (
              <div className={s.connector} style={{ background: ev.isPending ? 'var(--border)' : ev.color + '55' }} />
            )}
            {/* Dot */}
            <div className={`${s.dot} ${ev.isPending ? s.dotPending : ''}`}
              style={ev.isPending ? {} : { background: ev.color + '22', border: `2px solid ${ev.color}55` }}>
              <span className={s.dotInner} style={{ background: ev.color, opacity: ev.isPending ? .3 : 1 }} />
            </div>
            {/* Content */}
            <div className={s.content}>
              <div className={s.eventTitle} style={ev.isPending ? { color: 'var(--faint)' } : {}}>
                {ev.title}
                {fmt(ev.price) && (
                  <span className={s.price} style={{ color: ev.color }}>{fmt(ev.price)}</span>
                )}
              </div>
              {ev.date && <div className={s.date}>{ev.date}</div>}
              {ev.description && <div className={s.description}>{ev.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
