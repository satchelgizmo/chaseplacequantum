import { useState, useMemo } from 'react'
import s from './PriceChart.module.css'

const TABS = ['7D', '30D', '90D', 'All']

function buildPath(data, W, H, pad = 8) {
  if (data.length < 2) return { line: '', area: '', dots: [] }
  const mn = Math.min(...data), mx = Math.max(...data)
  const range = mx - mn || 1
  const inner = H - pad * 2
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = pad + inner - ((v - mn) / range) * inner
    return { x, y }
  })

  // Smooth bezier path
  const line = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
    const prev = pts[i - 1]
    const cx = (prev.x + pt.x) / 2
    return `${acc} C${cx.toFixed(1)},${prev.y.toFixed(1)} ${cx.toFixed(1)},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }, '')

  const area = `${line} L${W},${H} L0,${H} Z`
  return { line, area, pts }
}

export default function PriceChart({ history, currentPrice }) {
  const [tab, setTab] = useState('7D')
  const [hoverIdx, setHoverIdx] = useState(null)

  const data = history[tab] || []
  const W = 680, H = 120
  const { line, area, pts } = useMemo(() => buildPath(data, W, H), [data])

  const mn = Math.min(...data), mx = Math.max(...data)
  const pctChange = data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0] * 100) : 0
  const isUp = pctChange >= 0
  const lineColor = isUp ? 'var(--green)' : 'var(--red)'
  const gradId = `chartGrad-${tab}`

  const hoverPt = hoverIdx != null && pts ? pts[hoverIdx] : null
  const hoverVal = hoverIdx != null ? data[hoverIdx] : null

  return (
    <div className={`section-card ${s.chart}`}>
      <div className={s.header}>
        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>Price History</div>
          <div className={s.pctChange} style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
            {isUp ? '▲' : '▼'} {Math.abs(pctChange).toFixed(1)}% this period
          </div>
        </div>
        <div className={s.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${s.tab} ${tab === t ? s.tabActive : ''}`}
              onClick={() => { setTab(t); setHoverIdx(null) }}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className={s.svgWrap}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={s.svg}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const relX = (e.clientX - rect.left) / rect.width * W
            if (!pts) return
            let closest = 0, minDist = Infinity
            pts.forEach((pt, i) => {
              const d = Math.abs(pt.x - relX)
              if (d < minDist) { minDist = d; closest = i }
            })
            setHoverIdx(closest)
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={isUp ? '#00e5aa' : '#e05252'} stopOpacity=".22" />
              <stop offset="100%" stopColor={isUp ? '#00e5aa' : '#e05252'} stopOpacity="0"  />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" y1={H * f} x2={W} y2={H * f}
              stroke="rgba(255,255,255,.04)" strokeWidth="1" />
          ))}
          {/* Area + line */}
          <path d={area} fill={`url(#${gradId})`} />
          <path d={line}  fill="none" stroke={lineColor} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover crosshair */}
          {hoverPt && (
            <>
              <line x1={hoverPt.x} y1={0} x2={hoverPt.x} y2={H}
                stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={hoverPt.x} cy={hoverPt.y} r="4"
                fill={lineColor} stroke="var(--bg)" strokeWidth="2" />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoverPt && hoverVal != null && (
          <div className={s.tooltip}
            style={{ left: `${(hoverPt.x / W * 100).toFixed(1)}%` }}
          >
            ${hoverVal.toFixed(2)}
          </div>
        )}

        {/* Y-axis labels */}
        <div className={s.yLabels}>
          <span>${mx.toFixed(0)}</span>
          <span>${((mn + mx) / 2).toFixed(0)}</span>
          <span>${mn.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}
