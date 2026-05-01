import { useState } from 'react'
import s from './ListingTools.module.css'

export default function ListingTools({ card }) {
  const [copied, setCopied] = useState(false)

  function copyTitle() {
    navigator.clipboard.writeText(card.ebayTitle).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = card.ebayTitle
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="section-card">
      <div className="section-title">Listing Tools</div>

      <div className={s.titleBlock}>
        <div className={s.titleLabel}>eBay Title</div>
        <div className={s.titleText}>{card.ebayTitle}</div>
        <div className={s.charCount}>{card.ebayTitle.length} / 80 chars</div>
      </div>

      <div className={s.actions}>
        <button className={`btn ${copied ? 'btn-primary' : ''}`} onClick={copyTitle}>
          {copied ? '✓ Copied!' : '📋 Copy Title'}
        </button>
        <button className="btn btn-primary">
          📝 Build Listing
        </button>
        <a
          className="btn"
          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.ebayTitle)}&_sop=13`}
          target="_blank"
          rel="noopener noreferrer"
        >
          🔍 Find Comps
        </a>
      </div>

      {card.listed && (
        <div className={s.activeListing}>
          <div className={s.activeListingDot} />
          <div>
            <div className={s.activeListingLabel}>Active Listing</div>
            <div className={s.activeListingMeta}>
              Listed {card.listingDate} · BIN ${card.listingPrice}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
