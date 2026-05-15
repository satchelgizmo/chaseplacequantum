# Chase Place Quantum — Rebuild Architecture

## Why a Rebuild

The current app is ~6,600 lines of a single HTML file. All state, UI rendering, business logic, and CSS live in one file with no separation of concerns. The render system rebuilds entire pages by concatenating HTML strings. State is spread across ~20 global variables. Adding any new feature touches 3-4 unrelated sections of the file, which is why it feels like building on sand. The new architecture fixes all of this before adding photo capture, better mobile support, and future features.

---

## Guiding Principles

1. **One file is fine — messy one file is not.** We keep a single HTML file (no build tools, no npm, no server). But we organize it into clearly separated modules using the module pattern.
2. **Data layer is sacred.** All reads and writes go through one place. Nothing touches the store directly.
3. **Photo-first workflow.** The receive-cards flow is designed for mobile from day one.
4. **Preserve everything that works.** The fuzzy match scoring, title parser, eBay CSV export, checklist system — all carry over. We're rebuilding the plumbing, not the product.
5. **Supabase-ready but not Supabase-required.** The DB layer is an interface. Right now it talks to localStorage. When we're ready to go multi-device, we swap the implementation, not the callers.

---

## File Structure (single HTML file, module sections)

```
cpq.html
├── <head>
│   ├── CSS variables + reset
│   ├── Component styles (scoped by component name)
│   └── External scripts (SheetJS only)
│
└── <body>
    ├── Shell HTML (sidebar, topbar, main container, overlay)
    │
    └── <script type="module"> (or IIFE sections labeled clearly)
        │
        ├── 1. CONFIG
        │   Constants, card types, eBay field mappings
        │
        ├── 2. DB  ← the storage interface
        │   All localStorage reads/writes in one place
        │   Swap this section for Supabase later, nothing else changes
        │
        ├── 3. STORE  ← central in-memory state
        │   Single object, never mutated directly
        │   All mutations go through store.set() or store.patch()
        │
        ├── 4. PARSERS
        │   parseCardTitle(), buildStandardName()
        │   scoreSalePurchase(), getTopCandidates()
        │   All pure functions, no side effects
        │
        ├── 5. COMPUTED
        │   soldPids(), linkedPnl(), invCount()
        │   All derived from store, no state
        │
        ├── 6. ACTIONS  ← all business logic
        │   addPurchase(), editPurchase(), deletePurchase()
        │   addSale(), editSale(), linkSale(), unlinkSale()
        │   attachPhoto(), importCSV(), exportEbayTemplate()
        │   Each action: validate → mutate store → persist to DB → re-render
        │
        ├── 7. COMPONENTS  ← reusable UI builders
        │   Each returns an HTML string (same pattern as today, just organized)
        │   StatCard, FilterBar, SortTable, TagChip, MatchCard, PhotoGrid
        │
        ├── 8. PAGES  ← full page renderers
        │   renderDash(), renderInventory(), renderPurchases()
        │   renderSales(), renderListings(), renderImport()
        │   renderReceive()  ← NEW: mobile card receipt flow
        │   renderCalendar()
        │
        └── 9. INIT
            Router, keyboard shortcuts, image hover tooltip, render()
```

---

## Data Schema

This is the clean schema going forward. Every field is intentional.

### Card (purchase record)

```js
{
  id: 'P_1716000000000_a3f2',   // timestamp + random suffix — no more sequential IDs
  
  // Source data (from CSV import, never mutated after import)
  raw_title: string,             // original eBay listing title, verbatim
  raw_cost: number,              // what was actually in the CSV
  raw_date: string,              // as it came in
  source: 'ebay_csv' | 'manual' | 'receive',
  order_num: string,
  item_id: string,               // eBay item number
  seller: string,
  
  // Parsed / enriched (editable)
  player: string,
  year: string,
  set: string,
  variation: string,             // parallel name (Gold Prizm, Silver Wave, etc.)
  serial: string,                // e.g. "25" (stored without slash)
  grade: string,                 // PSA 10, BGS 9.5, etc.
  is_auto: boolean,
  is_rc: boolean,
  is_lot: boolean,
  lot_qty: number,
  type: string,                  // Soccer, NFL, Pokémon, etc.
  
  // Computed display
  cost: number,                  // effective per-card cost (raw_cost / lot_qty)
  display_name: string,          // buildStandardName() output, stored for search perf
  
  // Photo
  photos: string[],              // array of base64 data URLs or future Supabase URLs
  photo_taken_at: string | null, // ISO timestamp of receipt photo
  
  // Listing
  listed_price: number | null,
  listed_at: string | null,
  ebay_listing_id: string | null,
  
  // Meta
  notes: string,
  tags: string[],                // user-defined color tags
  created_at: string,            // ISO — when added to system
  updated_at: string,
}
```

**Key change from current app:** No more `purchases` array + `purchaseEdits` overlay. Everything is one flat record. The overlay pattern was clever but created complexity everywhere — `getP(id)` had to merge on every read, the backup had to explain v1 vs v2, new fields had to be added in two places. The new ID scheme (`P_timestamp_random`) also prevents the collision issues the current sequential IDs had during bulk import.

---

### Sale

```js
{
  id: 'S_1716000000000_b7c1',
  
  // Source
  raw_title: string,
  raw_price: number,
  raw_date: string,
  source: 'ebay_csv' | 'manual',
  platform: string,
  order_num: string,
  buyer: string,
  
  // Enriched
  player: string,
  year: string,
  set: string,
  variation: string,
  serial: string,
  grade: string,
  is_auto: boolean,
  type: string,
  
  // Display
  title: string,
  
  // Financials
  price: number,
  qty: number,
  fees: number,
  buyer_ship: number,            // shipping paid by buyer
  
  // Linking
  linked_card_ids: string[],     // replaces linkedPids + linkedPid legacy
  
  // Photo
  photos: string[],
  
  // Meta
  notes: string,
  created_at: string,
  updated_at: string,
}
```

---

### AppState (the central store)

```js
{
  // Core data
  cards: Card[],                 // all purchases
  sales: Sale[],                 // all sales
  
  // Reference data
  checklists: {                  // set name → {players, variants}
    [setName]: { players: string[], variants: string[] }
  },
  custom_players: string[],      // player names not in any checklist
  custom_types: {                // user-defined card categories
    [name]: { color: string }
  },
  category_defs: {               // user-defined tag categories
    [name]: { color: string }
  },
  value_lookups: {               // pid → market data
    [pid]: { avg: number, low: number, high: number, ts: string }
  },
  
  // UI state (not persisted)
  page: string,
  panel: { open: boolean, content: string },
  filters: { inv, buys, sells, listings, import: FilterState },
  sort: { [pageKey]: { col: string, dir: 1 | -1 } },
  page_num: { [pageKey]: number },
  page_size: number,
  selected_ids: Set<string>,     // for bulk operations
  
  // Receive flow state
  receive_draft: ReceiveDraft | null,
}
```

---

### ReceiveDraft (new — mobile receipt flow)

```js
{
  // Filled in as cards arrive
  cards: [
    {
      temp_id: string,           // before committing to store
      photo_data: string,        // base64 captured on phone
      photo_taken_at: string,
      raw_title: string,         // typed or pasted on phone
      cost: number,
      // other fields pre-filled from title parser
      player: string,
      type: string,
      ...
    }
  ],
  order_num: string,
  seller: string,
  order_date: string,
  confirmed: boolean,
}
```

This is the key new workflow: when a package arrives, open app on phone → New Receipt → enter order info once → photograph each card → title auto-parsed → tap Confirm → all cards committed to inventory with photos attached.

---

## DB Interface (storage layer)

```js
const DB = {
  // localStorage implementation (default)
  async load()   → AppState partial,
  async save(state) → void,
  async saveCards(cards) → void,
  async saveSales(sales) → void,
  async saveCard(card) → void,     // single card update (for photo attach)
  async exportBackup() → JSON file download,
  async importBackup(file) → AppState partial,
}
```

All persistence logic lives here and only here. The rest of the app calls `DB.saveCards(state.cards)` and never touches `localStorage` directly. When we add Supabase, we write a `SupabaseDB` that implements the same interface and swap it in at the top of the file.

---

## The STORE Pattern

Instead of 20 global variables that render functions read directly, everything goes through one object:

```js
const Store = {
  state: { ...initialState },
  
  get(key) { return this.state[key]; },
  
  patch(key, partial) {
    this.state[key] = { ...this.state[key], ...partial };
    // Persist if it's a data key
    if (['cards','sales','checklists'].includes(key)) DB.save(this.state);
    // Re-render
    render();
  },
  
  setCards(cards) { ... },
  setSales(sales) { ... },
}
```

No more scattered `purchaseEdits[pid] = {...}` calls buried in event handlers. All mutations are explicit, traceable, and automatically persisted.

---

## Actions Layer

Every user action is a named function in the ACTIONS module:

```js
Actions = {
  // Cards
  importCardCSV(file),
  addCardManual(fields),
  editCard(id, fields),          // replaces editP() — always patches the card directly
  deleteCard(id),
  attachPhoto(id, dataUrl),      // NEW — attaches base64 photo to card
  bulkExportEbay(ids),
  
  // Sales
  importSaleCSV(file),
  addSaleManual(fields),
  editSale(id, fields),
  linkSale(saleId, cardId),
  unlinkSale(saleId, cardId),
  autoLinkAll(),
  
  // Receive flow (NEW)
  startReceive(orderInfo),
  addReceivePhoto(tempId, dataUrl),
  updateReceiveDraft(tempId, fields),
  commitReceive(),               // converts all drafts to real cards
  
  // Listings
  markListed(cardId, price),
  unmarkListed(cardId),
  importActiveListings(data),
  
  // Reference data
  importChecklist(setName, text),
  deleteChecklist(setName),
  addCustomType(name, color),
  deleteCustomType(name),
}
```

Each action follows the same pattern: validate input → compute new state → call DB → render. No spaghetti.

---

## Photo Strategy

**Phase 1 (now):** Base64 stored directly in the card record, inside the JSON backup. A card photo is typically 50-150KB as base64 (after compression). At 500 cards in inventory that's 25-75MB — within localStorage's 5-10MB limit only if we compress aggressively. Realistically we'll want to store photos separately.

**Better Phase 1:** Store photos in IndexedDB (separate from localStorage, 50MB+ limit, same device), reference them by card ID. The card record just stores `{ has_photo: true }`. IndexedDB is not in the JSON backup — photos are device-local. This is fine for now since photos are a nice-to-have display layer, not critical business data.

**Phase 2 (Supabase):** Replace IndexedDB with Supabase Storage bucket. Card record stores `{ photo_url: 'https://...' }`. Works across all devices. One line change in `attachPhoto()` action.

**On mobile:** The receive flow uses `<input type="file" accept="image/*" capture="environment">` — this opens the camera on mobile browsers natively, no special permissions needed.

---

## What Carries Over Unchanged

These systems worked well and copy over with minimal changes:

- **`parseCardTitle()`** — the title parser. Pure function, no state dependencies.
- **`scoreSalePurchase()`** — fuzzy match scoring. Copy verbatim.
- **`getTopCandidates()`** — top match candidates. Adjust to use new card schema.
- **`buildStandardName()`** — display name builder. Copy verbatim.
- **eBay CSV export** — same column mappings, same logic, just called from `Actions.bulkExportEbay()`.
- **eBay CSV import** — same parser, just feeds into `Actions.importCardCSV()`.
- **Checklist system** — same data structure, moved into store.
- **`PLAYER_NOISE` set** — copy verbatim.
- **Dashboard analytics** — all the `_computeDash()` logic copies over as pure computed functions.
- **The visual design** — same color system, same component aesthetic.

---

## New Features Unlocked by This Architecture

Once the foundation is right, these become straightforward to add:

1. **Receipt flow** — capture photo + title on mobile, batch commit to inventory
2. **Photo gallery** — carousel in card detail panel, multiple photos per card
3. **eBay listing prep** — pre-filled draft with photos already attached
4. **Bulk photo import** — drag a folder of images, match to cards by filename pattern
5. **Supabase sync** — swap DB layer, get multi-device for free
6. **Offline PWA** — service worker + manifest, installable on phone home screen
7. **AI title enrichment** — call Anthropic API in `parseCardTitle()` for ambiguous titles
8. **Price alerts** — scheduled market lookups for high-value inventory

---

## Build Order

1. **Scaffold** — shell HTML, CSS variables, sidebar, routing skeleton
2. **DB + Store** — the storage interface and central state (no UI yet, just unit-testable functions)
3. **Parsers** — copy title parser, scorer, name builder — all pure functions
4. **Import flows** — CSV import for purchases and sales (this unlocks loading real data)
5. **Inventory + Purchases pages** — table view, filter, sort, detail panel
6. **Sales + P&L** — linking, unlink, panel
7. **Dashboard** — computed analytics, charts
8. **Receive flow** — mobile photo capture (this is the new crown jewel)
9. **Listings** — eBay export, active listings import
10. **Calendar**
11. **Backup / restore**

Steps 1-7 restore feature parity with the current app. Steps 8-11 are the improvements.
