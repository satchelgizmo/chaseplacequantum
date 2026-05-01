import { useState } from 'react'
import CardDetailPage from './components/CardDetailPage'
import { mockCard, mockOhtaniCard } from './mockData'

export default function App() {
  const [card, setCard] = useState(mockCard)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Demo switcher */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 1000,
        display: 'flex', gap: 8, background: 'var(--surf2)',
        border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px',
        fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--dim)',
      }}>
        <span style={{ color: 'var(--faint)' }}>Demo:</span>
        <button
          className="btn btn-sm btn-ghost"
          style={{ fontSize: 10, padding: '2px 8px', color: card.id === mockCard.id ? 'var(--cyan)' : 'var(--dim)' }}
          onClick={() => setCard(mockCard)}
        >Lily Yohannes RC</button>
        <button
          className="btn btn-sm btn-ghost"
          style={{ fontSize: 10, padding: '2px 8px', color: card.id === mockOhtaniCard.id ? 'var(--gold)' : 'var(--dim)' }}
          onClick={() => setCard(mockOhtaniCard)}
        >Ohtani (MVP Buyback)</button>
      </div>

      <CardDetailPage card={card} onCardChange={setCard} />
    </div>
  )
}
