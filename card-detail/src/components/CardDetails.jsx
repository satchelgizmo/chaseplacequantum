import { useState } from 'react'
import s from './CardDetails.module.css'

function EditableField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(String(value ?? ''))

  function commit() {
    setEditing(false)
    if (draft !== String(value ?? '')) onChange(draft)
  }

  if (editing) {
    return (
      <div className={s.field}>
        <div className={s.fieldLabel}>{label}</div>
        <input
          className={s.fieldInput}
          value={draft}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        />
      </div>
    )
  }

  return (
    <div className={s.field} onClick={() => { setDraft(String(value ?? '')); setEditing(true) }} title="Click to edit">
      <div className={s.fieldLabel}>{label}</div>
      <div className={s.fieldValue}>
        {value != null && value !== '' ? String(value) : <span className={s.fieldEmpty}>—</span>}
        <span className={s.editHint}>✏</span>
      </div>
    </div>
  )
}

function BoolField({ label, value, onChange }) {
  return (
    <div className={s.field}>
      <div className={s.fieldLabel}>{label}</div>
      <div className={s.fieldValue}>
        <button
          className={`${s.boolBtn} ${value ? s.boolOn : s.boolOff}`}
          onClick={() => onChange(!value)}
        >
          {value ? '✓ Yes' : '✕ No'}
        </button>
      </div>
    </div>
  )
}

export default function CardDetails({ card, onSave }) {
  const fields = [
    { key: 'player',      label: 'Player / Subject', type: 'text' },
    { key: 'year',        label: 'Year',             type: 'text' },
    { key: 'brand',       label: 'Brand',            type: 'text' },
    { key: 'set',         label: 'Set',              type: 'text' },
    { key: 'variation',   label: 'Variation',        type: 'text' },
    { key: 'cardNumber',  label: 'Card #',           type: 'text' },
    { key: 'printRun',    label: 'Print Run',        type: 'text' },
    { key: 'category',    label: 'Category',         type: 'text' },
    { key: 'team',        label: 'Team',             type: 'text' },
    { key: 'condition',   label: 'Condition',        type: 'text' },
    { key: 'grade',       label: 'Grade',            type: 'text' },
    { key: 'isRookieCard', label: 'Rookie Card',     type: 'bool' },
    { key: 'notes',       label: 'Notes',            type: 'text', wide: true },
  ]

  return (
    <div className="section-card">
      <div className={s.header}>
        <div className="section-title" style={{ marginBottom: 0 }}>Card Details</div>
        <div className={s.hint}>Click any field to edit</div>
      </div>
      <div className={s.grid}>
        {fields.map(f =>
          f.type === 'bool'
            ? <BoolField key={f.key} label={f.label} value={!!card[f.key]}
                onChange={v => onSave({ [f.key]: v })} />
            : <EditableField key={f.key} label={f.label} value={card[f.key]}
                onChange={v => onSave({ [f.key]: v })} />
        )}
      </div>
    </div>
  )
}
