export interface SellerOffer {
  sellerName: string;
  price: number;
  isPrime?: boolean;
  rating?: number;
  condition?: string;
  isBuyBoxWinner?: boolean;
}

export interface ProductVariant {
  id: string;
  skuOrAsin?: string;
  size?: string;         // e.g. "250 g", "UK 7", "1 Litre", "XL"
  color?: string;        // e.g. "Slate Blue", "Matte Black", "Army Green"
  flavour?: string;      // e.g. "Fruit Punch", "Unflavoured", "Double Rich Chocolate", "Watermelon"
  style?: string;        // e.g. "Standard", "With Shaker", "Pack of 2", "Wireless ANC"
  buildType?: string;    // e.g. "Tri-Ply Stainless Steel", "Virgin Aluminium", "Hard Anodised"
  material?: string;     // e.g. "Breathable Air Mesh", "SS 304 Grade", "100% Khadi Cotton"
  dimensions?: string;   // e.g. "250 g", "500 ml", "1 Litre", "3 Litre", "15.6-inch"
  price: number;
  originalPrice?: number;
  inStock: boolean;
  image?: string;
  seller?: string;
  optionLabel?: string;  // Composite display label e.g. "Fruit Punch · 250 g"
  attributes?: Record<string, string>;
}

export interface AmazonProduct {
  id: string;
  asin?: string;
  title: string;
  url: string;
  image: string;
  thumbnails?: string[];
  price: number | null;
  originalPrice?: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  isPrime: boolean;
  inStock: boolean;
  sizes: string[];
  materials: string[];
  specifications: Record<string, string>;
  features: string[];
  brand?: string;
  badge?: string; // e.g. "Overall Pick", "Best Seller", "Amazon's Choice"
  scrapedAt: string;
  source: 'direct_html' | 'ai_grounded' | 'parsed_dom' | 'firecrawl';

  // Seller information
  seller?: string;
  availableSellers?: string[];
  sellerOffers?: SellerOffer[];

  // Multi-option & variant price variation
  variants?: ProductVariant[];
  priceRange?: { min: number; max: number };
  availableColors?: string[];
  availableFlavours?: string[];
  availableStyles?: string[];
  availableBuildTypes?: string[];
  availableDimensions?: string[];
  availableSizes?: string[];
  selectedVariantId?: string;
}

export interface ScrapeOptions {
  domain: string; // default 'in' for Amazon.in
  maxResults?: number;
  useAiFallback?: boolean;
}

export interface ScrapeRequestPayload {
  mode: 'search' | 'url' | 'raw_html';
  query?: string;
  url?: string;
  html?: string;
  apiKey?: string; // Custom Firecrawl API key entered by user
  options?: ScrapeOptions;
}

export interface ScrapeResultResponse {
  success: boolean;
  queryOrUrl: string;
  mode: 'search' | 'url' | 'raw_html';
  count: number;
  products: AmazonProduct[];
  source: 'live_scrape' | 'ai_grounded' | 'raw_html' | 'firecrawl';
  warning?: string;
  error?: string;
  durationMs: number;
}

export interface CompetitorOptionPrice {
  price: number;
  unitOrVolume?: string; // e.g. "350 ml", "400 ml", "450 ml", "750 ml"
  variantLabel?: string;
  seller?: string;
  notes?: string;
}

export interface MarketComparisonRow {
  id: string;
  image: string;
  sku: string;
  description: string;
  catalogueMrp: number; // e.g. 450
  currency?: string;
  seller?: string;
  competitors: Record<string, CompetitorOptionPrice[]>; // e.g. { "AIMKO": [{ price: 275, unitOrVolume: "350 ml" }] }
  notes?: string;
}

export interface MarketComparisonSheetData {
  title: string;
  subtitle: string;
  description: string;
  competitorBrands: string[];
  availableSellers?: string[];
  rows: MarketComparisonRow[];
}

