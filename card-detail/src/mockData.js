export const mockCard = {
  id: 'lily-2024-obsidian-iridescent',
  player: 'Lily Yohannes',
  year: '2024-25',
  brand: 'Panini',
  set: 'Obsidian',
  variation: 'Iridescent',
  cardNumber: '121',
  serial: '08',
  printRun: 15,
  category: 'Soccer',
  isRookieCard: true,
  cost: 38.50,
  marketValue: 57.00,
  notes: 'Pulled from a group break. Centered well, corners sharp. Strong RC stock.',
  ebayTitle: 'LILY YOHANNES 2024-25 Panini Obsidian Iridescent RC #121 /15 Soccer Rookie',
  mvpBuybackEligible: false,
  purchaseDate: '2025-01-15',
  purchasePrice: 38.50,
  purchasePlatform: 'eBay',
  listed: true,
  listingPrice: 64.99,
  listingDate: '2025-01-20',
  grade: null,
  gradingStatus: null,
  team: 'Seattle Reign FC',
  league: 'NWSL',
  condition: 'Raw / NM-MT',
};

// 7-day prices, latest last
const seed7 = [38.00, 40.50, 39.25, 44.00, 49.50, 53.00, 57.00];
const seed30 = [
  28,29,31,30,33,32,35,34,36,38,37,40,39,42,41,44,43,45,46,48,47,50,49,51,52,54,53,56,55,57
];
const seed90 = Array.from({length:90},(_,i)=>{
  const t=i/89; return Math.round((22+t*28+Math.sin(i/6)*3+Math.sin(i/13)*5)*10)/10;
});
const seedAll = Array.from({length:180},(_,i)=>{
  const t=i/179; return Math.round((14+t*38+Math.sin(i/10)*4+Math.sin(i/25)*7)*10)/10;
});

export const mockPriceHistory = { '7D': seed7, '30D': seed30, '90D': seed90, 'All': seedAll };

export const mockMarketData = {
  lastSold: 52.00,
  lastSoldDate: 'Apr 28, 2025',
  avg30: 47.80,
  high30: 64.00,
  low30: 31.50,
  totalSales: 23,
  psa10Pop: 4,
  psa9Pop: 11,
};

export const mockJourneyEvents = [
  {
    id: 1, type: 'purchase', title: 'Purchased',
    date: 'Jan 15, 2025', price: 38.50,
    description: 'eBay · Seller: premium_breaks_usa',
    color: 'var(--orange)',
  },
  {
    id: 2, type: 'listed', title: 'Listed on eBay',
    date: 'Jan 20, 2025', price: 64.99,
    description: 'Buy It Now · 7-day listing',
    color: 'var(--blue)',
  },
  {
    id: 3, type: 'price_drop', title: 'Price Adjusted',
    date: 'Feb 03, 2025', price: 59.99,
    description: 'Relisted · Updated price based on recent comps',
    color: 'var(--dim)',
  },
  {
    id: 4, type: 'pending', title: 'Awaiting Sale',
    date: null, price: null,
    description: 'Currently listed',
    color: 'var(--faint)',
    isPending: true,
  },
];

export const mockSimilarCards = [
  {
    id: 'lily-2024-obsidian-electric',
    player: 'Lily Yohannes',
    set: 'Obsidian',
    variation: 'Electric Etch Green',
    printRun: 25,
    image: null,
    marketPrice: 42.00,
    userCost: 24.00,
    isOwned: true,
    category: 'Soccer',
  },
  {
    id: 'trinity-2024-obsidian-iridescent',
    player: 'Trinity Rodman',
    set: 'Obsidian',
    variation: 'Iridescent',
    printRun: 15,
    image: null,
    marketPrice: 285.00,
    userCost: null,
    isOwned: false,
    category: 'Soccer',
  },
  {
    id: 'sophia-2024-obsidian-iridescent',
    player: 'Sophia Smith',
    set: 'Obsidian',
    variation: 'Iridescent',
    printRun: 15,
    image: null,
    marketPrice: 148.00,
    userCost: 95.00,
    isOwned: true,
    category: 'Soccer',
  },
  {
    id: 'mallory-2024-obsidian-iridescent',
    player: 'Mallory Swanson',
    set: 'Obsidian',
    variation: 'Iridescent',
    printRun: 15,
    image: null,
    marketPrice: 89.00,
    userCost: null,
    isOwned: false,
    category: 'Soccer',
  },
  {
    id: 'naomi-2024-obsidian-iridescent',
    player: 'Naomi Girma',
    set: 'Obsidian',
    variation: 'Iridescent',
    printRun: 15,
    image: null,
    marketPrice: 195.00,
    userCost: 210.00,
    isOwned: true,
    category: 'Soccer',
  },
  {
    id: 'alex-2024-obsidian-electric',
    player: 'Alex Morgan',
    set: 'Obsidian',
    variation: 'Electric Etch Blue',
    printRun: 49,
    image: null,
    marketPrice: 55.00,
    userCost: null,
    isOwned: false,
    category: 'Soccer',
  },
];

// Mock card for Shohei Ohtani to demo MVP Buyback button
export const mockOhtaniCard = {
  ...mockCard,
  id: 'ohtani-2024-chrome-gold',
  player: 'Shohei Ohtani',
  year: '2024',
  brand: 'Topps',
  set: 'Chrome',
  variation: 'Gold Refractor',
  printRun: 50,
  category: 'MLB',
  isRookieCard: false,
  cost: 220.00,
  marketValue: 310.00,
  ebayTitle: 'SHOHEI OHTANI 2024 Topps Chrome Gold Refractor #/50 MLB',
  mvpBuybackEligible: true,
  notes: '2024 AL MVP. Buyback eligible per Topps program.',
  team: 'Los Angeles Dodgers',
  league: 'MLB',
};
