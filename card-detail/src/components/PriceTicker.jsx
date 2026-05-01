import { useState, useEffect, useRef } from 'react'
import s from './PriceTicker.module.css'

export default function PriceTicker({ basePrice, card }) {
  const [price, setPrice]     = useState(basePrice)
  const [open]                = useState(basePrice)
  const [history, setHistory] = useState([basePrice])
  const priceRef = useRef(basePrice)

  useEffect(() => {
    setPrice(basePrice)
    priceRef.current = basePrice
    setHistory([basePrice])
  }, [basePrice])

  useEffect(() => {
    const id = setInterval(() => {
      setPrice(prev => {
        const drift = prev * (Math.random() * 0.006 - 0.003)
        const next  = Math.max(0.01, +(prev + drift).toFixed(2))
        priceRef.current = next
        setHistory(h => [...h.slice(-29), next])
        return next
      })
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const change    = price - open
  const changePct = (change / open * 100)
  const isUp      = change >= 0
  const color     = isUp ? 'var(--green)' : 'var(--red)'

  // Mini sparkline
  const W = 260, H = 36
  const pts = history
  const mn  = Math.min(...pts), mx = Math.max(...pts)
  const range = mx - mn || 1
  const coords = pts.map((v, i) => {
    const x = (i / Math.max(pts.length - 1, 1)) * W
    const y = H - ((v - mn) / range) * H
    return [x, y]
  })
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = d + ` L${W},${H} L0,${H} Z`

  return (
    <div className={s.ticker}>
      <div className={s.label}>Live Price (est.)</div>
      <div className={s.priceRow}>
        <span className={s.price}>${price.toFixed(2)}</span>
        <span className={s.change} style={{ color }}>
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
      </div>
      <div className={s.changeDollar} style={{ color }}>
        {isUp ? '+' : ''}{change.toFixed(2)} from open
      </div>

      {/* Mini sparkline */}
      <svg className={s.spark} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="tickerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isUp ? '#00e5aa' : '#e05252'} stopOpacity=".35" />
            <stop offset="100%" stopColor={isUp ? '#00e5aa' : '#e05252'} stopOpacity="0"  />
          </linearGradient>
        </defs>
        {pts.length > 1 && (
          <>
            <path d={area} fill="url(#tickerGrad)" />
            <path d={d}    fill="none" stroke={isUp ? 'var(--green)' : 'var(--red)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>

      <div className={s.meta}>
        <span>Open {open.toFixed(2)}</span>
        <span className={s.live}>● LIVE</span>
      </div>
    </div>
  )
}
