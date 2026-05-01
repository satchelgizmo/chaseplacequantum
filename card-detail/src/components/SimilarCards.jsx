import { useState } from 'react'
import s from './SimilarCards.module.css'

const fmt = n => n == null ? '—' : `$${Number(n).toFixed(2)}`

function CardTile({ card, onNavigate }) {
  const [watchlisted, setWatchlisted] = useState(false)
  const pnl     = card.isOwned && card.userCost != null ? card.marketPrice - card.userCost : null
  const pnlPct  = pnl != null && card.userCost > 0 ? (pnl / card.userCost * 100) : null
  const pnlUp   = pnl != null && pnl >= 0

  return (
    <div className={s.tile} onClick={() => onNavigate(card)}>
      {/* Image */}
      <div className={s.tileImage}>
        <div className={s.imagePlaceholder}>🃏</div>
        {card.isOwned && <div className={s.ownedBadge}>In Collection</div>}
        {card.printRun && <div className={s.serialChip}>/{card.printRun}</div>}
      </div>

      {/* Info */}
      <div className={s.tileBody}>
        <div className={s.player}>{card.player}</div>
        <div className={s.setName}>{card.set}</div>
        <div className={s.variation}>{card.variation}</div>

        <div className={s.prices}>
          <div className={s.marketPrice}>{fmt(card.marketPrice)}</div>
          {card.isOwned && card.userCost != null && (
            <div className={s.ownedPrices}>
              <span className={s.costBasis}>Cost {fmt(card.userCost)}</span>
              {pnl != null && (
                <span className={s.pnlChip} style={{
                  background: pnlUp ? 'rgba(0,229,170,.15)' : 'rgba(224,82,82,.15)',
                  color: pnlUp ? 'var(--green)' : 'var(--red)',
                  border: `1px solid ${pnlUp ? 'rgba(0,229,170,.3)' : 'rgba(224,82,82,.3)'}`,
                }}>
                  {pnlUp ? '+' : ''}{fmt(pnl)}
                  {pnlPct != null && ` (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(0)}%)`}
                </span>
              )}
            </div>
          )}
        </div>

        {!card.isOwned && (
          <button
            className={`${s.watchBtn} ${watchlisted ? s.watchBtnActive : ''}`}
            onClick={e => { e.stopPropagation(); setWatchlisted(v => !v) }}
          >
            {watchlisted ? '★ Watching' : '☆ Watchlist'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SimilarCards({ cards, onNavigate }) {
  return (
    <div className="section-card">
      <div className={s.header}>
        <div className="section-title" style={{ marginBottom: 0 }}>Similar Cards</div>
        <div className={s.legend}>
          <span className={s.legendDot} style={{ background: 'var(--cyan)' }} />
          <span>Owned</span>
          <span className={s.legendDot} style={{ background: 'var(--dim)', opacity: .4 }} />
          <span>Not Owned</span>
        </div>
      </div>
      <div className={s.scroll}>
        {cards.map(card => (
          <CardTile key={card.id} card={card} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}
