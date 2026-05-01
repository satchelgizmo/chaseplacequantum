import { useState } from 'react'
import s from './GradingTracker.module.css'

const STEPS = [
  { key: 'submitted',  label: 'Submitted',          icon: '📬' },
  { key: 'received',   label: 'Received',            icon: '📦' },
  { key: 'grading',    label: 'Grading in Progress', icon: '🔬' },
  { key: 'assigned',   label: 'Grade Assigned',      icon: '🏅' },
  { key: 'shipped',    label: 'Shipped Back',         icon: '🚚' },
]
const COMPANIES   = ['PSA', 'BGS', 'SGC', 'CGC']
const SVC_LEVELS  = ['Economy (45–60 days)', 'Regular (20 days)', 'Express (10 days)', 'Super Express (5 days)', 'Walkthrough (2 days)']

const COMPANY_COLORS = { PSA: 'var(--blue)', BGS: 'var(--purple)', SGC: 'var(--orange)', CGC: 'var(--gold)' }

export default function GradingTracker({ card }) {
  const [mode,      setMode]      = useState('idle')   // idle | form | tracking
  const [formData,  setFormData]  = useState({ company: 'PSA', submitDate: '', svcLevel: SVC_LEVELS[0], cost: '' })
  const [activeStep, setActiveStep] = useState(0)       // 0-indexed step
  const [submission, setSubmission] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmission(formData)
    setMode('tracking')
    setActiveStep(0)
  }

  function advanceStep() {
    setActiveStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  if (mode === 'tracking' && submission) {
    const compColor = COMPANY_COLORS[submission.company] || 'var(--cyan)'
    return (
      <div className={`section-card ${s.tracker}`}>
        <div className={s.trackerHeader}>
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>Grading Status</div>
            <span className={s.companyBadge} style={{ background: `${compColor}22`, color: compColor, border: `1px solid ${compColor}44` }}>
              {submission.company}
            </span>
          </div>
          <div className={s.trackerMeta}>
            <div className={s.metaRow}><span>Submitted</span><span>{submission.submitDate || '—'}</span></div>
            <div className={s.metaRow}><span>Cost</span><span>{submission.cost ? `$${submission.cost}` : '—'}</span></div>
          </div>
        </div>

        <div className={s.steps}>
          {STEPS.map((step, i) => {
            const isComplete = i < activeStep
            const isActive   = i === activeStep
            const isPending  = i > activeStep
            return (
              <div key={step.key} className={s.stepRow}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`${s.connector} ${isComplete ? s.connectorDone : ''}`} />
                )}
                {/* Dot */}
                <div className={`${s.dot} ${isComplete ? s.dotDone : ''} ${isActive ? s.dotActive : ''} ${isPending ? s.dotPending : ''} ${isActive ? 'pulse' : ''}`}>
                  {isComplete ? '✓' : step.icon}
                </div>
                {/* Label */}
                <div className={s.stepInfo}>
                  <div className={`${s.stepLabel} ${isActive ? s.stepLabelActive : ''} ${isPending ? s.stepLabelPending : ''}`}>
                    {step.label}
                  </div>
                  {isActive && <div className={s.stepSub}>In progress · {submission.svcLevel.split(' ')[0]}</div>}
                  {isComplete && <div className={s.stepSub} style={{ color: 'var(--green)' }}>Complete</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Dev controls */}
        <div className={s.devControls}>
          {activeStep < STEPS.length - 1 && (
            <button className="btn btn-sm" onClick={advanceStep} title="Simulate status update">
              ⏩ Advance Step (demo)
            </button>
          )}
          <button className="btn btn-sm btn-ghost" onClick={() => { setMode('idle'); setSubmission(null); setActiveStep(0) }}>
            ✕ Reset
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`section-card ${s.tracker}`}>
      <div className="section-title">Grading</div>

      {mode === 'idle' && (
        <div className={s.idle}>
          <div className={s.idleIcon}>📋</div>
          <div className={s.idleText}>Not yet submitted for grading</div>
          <div className={s.idleSub}>Submit to PSA, BGS, SGC, or CGC to potentially increase value</div>
          <button className="btn btn-primary btn-sm" onClick={() => setMode('form')}>
            + Submit for Grading
          </button>
        </div>
      )}

      {mode === 'form' && (
        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.formGrid}>
            <label className={s.formLabel}>
              Company
              <select
                className={s.formSelect}
                value={formData.company}
                onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
              >
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={s.formLabel}>
              Submission Date
              <input
                type="date"
                className={s.formInput}
                value={formData.submitDate}
                onChange={e => setFormData(f => ({ ...f, submitDate: e.target.value }))}
              />
            </label>
            <label className={s.formLabel} style={{ gridColumn: '1 / -1' }}>
              Service Level
              <select
                className={s.formSelect}
                value={formData.svcLevel}
                onChange={e => setFormData(f => ({ ...f, svcLevel: e.target.value }))}
              >
                {SVC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className={s.formLabel}>
              Grading Cost ($)
              <input
                type="number"
                step="0.01"
                min="0"
                className={s.formInput}
                placeholder="e.g. 25.00"
                value={formData.cost}
                onChange={e => setFormData(f => ({ ...f, cost: e.target.value }))}
              />
            </label>
          </div>
          <div className={s.formActions}>
            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setMode('idle')}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
