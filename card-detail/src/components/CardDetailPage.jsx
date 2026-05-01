import PriceTicker from './PriceTicker'
import PriceChart from './PriceChart'
import GradingTracker from './GradingTracker'
import CardJourney from './CardJourney'
import CardDetails from './CardDetails'
import SimilarCards from './SimilarCards'
import ListingTools from './ListingTools'
import { mockPriceHistory, mockMarketData, mockJourneyEvents, mockSimilarCards } from '../mockData'
import s from './CardDetailPage.module.css'

const fmt = (n) => n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function StatBox({ label, value, color, sub }) {
  return (
    <div className={s.statBox}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue} style={color ? { color } : {}}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  )
}

function CategoryBadge({ cat }) {
  const colors = {
    Soccer: { bg: 'rgba(0,229,170,.1)', color: 'var(--green)', border: 'rgba(0,229,170,.2)' },
    MLB:    { bg: 'rgba(164,126,245,.1)', color: 'var(--purple)', border: 'rgba(164,126,245,.2)' },
    NFL:    { bg: 'rgba(77,166,255,.1)', color: 'var(--blue)', border: 'rgba(77,166,255,.2)' },
    NBA:    { bg: 'rgba(245,130,74,.1)', color: 'var(--orange)', border: 'rgba(245,130,74,.2)' },
    'Pokémon': { bg: 'rgba(245,200,66,.1)', color: 'var(--gold)', border: 'rgba(245,200,66,.2)' },
  }
  const c = colors[cat] || { bg: 'rgba(255,255,255,.05)', color: 'var(--dim)', border: 'rgba(255,255,255,.1)' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 3,
      fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 500, letterSpacing: '.5px',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{cat}</span>
  )
}

export default function CardDetailPage({ card, onCardChange }) {
  const pnl = card.marketValue - card.cost
  const pnlPct = (pnl / card.cost * 100)
  const pnlColor = pnl >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div className={s.page}>
      {/* ── Breadcrumb ── */}
      <div className={s.breadcrumb}>
        <span className={s.breadHome}>← Inventory</span>
        <span className={s.breadSep}>/</span>
        <span className={s.breadCurrent}>{card.player} · {card.set} {card.variation}</span>
      </div>

      {/* ── Main layout ── */}
      <div className={s.layout}>
        {/* ════ SIDEBAR ════ */}
        <aside className={s.sidebar}>
          {/* Card image frame */}
          <div className={s.imageFrame}>
            <div className={s.imagePlaceholder}>
              <div className={s.imagePlaceholderInner}>
                <span className={s.imagePlaceholderIcon}>🃏</span>
                <span className={s.imagePlaceholderText}>{card.player}</span>
                <span className={s.imagePlaceholderSub}>{card.year} {card.set}</span>
              </div>
            </div>
            {card.isRookieCard && <div className={s.rcBadge}>RC</div>}
            {card.printRun && (
              <div className={s.serialBadge}>
                #{card.serial || '—'} / {card.printRun}
              </div>
            )}
          </div>

          {/* Live price ticker */}
          <PriceTicker basePrice={card.marketValue} card={card} />

          {/* Status pills */}
          <div className={s.statusRow}>
            {card.listed
              ? <span className={s.pillListed}>LISTED {fmt(card.listingPrice)}</span>
              : <span className={s.pillInStock}>IN STOCK</span>
            }
            {card.grade
              ? <span className={s.pillGraded}>{card.grade}</span>
              : <span className={s.pillRaw}>RAW</span>
            }
            <CategoryBadge cat={card.category} />
          </div>

          {/* Quick actions */}
          <div className={s.actions}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              📝 Build Listing
            </button>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              🔍 Find Comps
            </button>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              📋 Copy Title
            </button>
            {card.mvpBuybackEligible && (
              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                🏆 Buyback Eligible
              </button>
            )}
            <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              🗑 Remove Card
            </button>
          </div>
        </aside>

        {/* ════ MAIN COLUMN ════ */}
        <main className={s.main}>
          {/* ── Stat row ── */}
          <div className={s.statRow}>
            <StatBox label="Cost Basis" value={fmt(card.cost)} color="var(--orange)" />
            <StatBox
              label="Market Value"
              value={fmt(card.marketValue)}
              color="var(--cyan)"
              sub="est. based on recent sales"
            />
            <StatBox
              label="Unrealized P&L"
              value={(pnl >= 0 ? '+' : '') + fmt(pnl)}
              color={pnlColor}
              sub={`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}% ROI`}
            />
          </div>

          {/* ── Price chart ── */}
          <PriceChart history={mockPriceHistory} currentPrice={card.marketValue} />

          {/* ── Market data + grading ── */}
          <div className={s.twoCol}>
            <MarketDataTable data={mockMarketData} />
            <GradingTracker card={card} />
          </div>

          {/* ── Card Journey ── */}
          <CardJourney events={mockJourneyEvents} />

          {/* ── Listing Tools ── */}
          <ListingTools card={card} />

          {/* ── Card Details (editable) ── */}
          <CardDetails card={card} onSave={(fields) => onCardChange({ ...card, ...fields })} />

          {/* ── Similar Cards ── */}
          <SimilarCards cards={mockSimilarCards} onNavigate={(c) => console.log('navigate to', c.id)} />
        </main>
      </div>
    </div>
  )
}

function MarketDataTable({ data }) {
  const fmt = (n) => n == null ? '—' : `$${n.toFixed(2)}`
  const rows = [
    ['Last Sold', `${fmt(data.lastSold)} · ${data.lastSoldDate}`],
    ['30-Day Avg', fmt(data.avg30)],
    ['30-Day High', fmt(data.high30)],
    ['30-Day Low', fmt(data.low30)],
    ['Total Sales (90d)', data.totalSales],
    ['PSA 10 Pop', data.psa10Pop],
    ['PSA 9 Pop', data.psa9Pop],
  ]
  return (
    <div className="section-card" style={{ flex: 1 }}>
      <div className="section-title">Market Data</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '7px 0', color: 'var(--dim)', fontSize: 12, fontFamily: 'var(--mono)', width: '55%' }}>
                {label}
              </td>
              <td style={{ padding: '7px 0', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'right', fontWeight: 500 }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
