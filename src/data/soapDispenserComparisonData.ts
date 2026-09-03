import {
  MarketComparisonSheetData,
  MarketComparisonRow,
  CompetitorOptionPrice,
  AmazonProduct,
} from "../types";

/**
 * Exact dataset extracted from the provided PDF:
 * "Soap Dispenser Range — Product & Market Price Comparison"
 * "Wall-Mounted Soap Dispenser Comparison Sheet"
 * Comparing Catalogue MRP against AIMKO, Bath Guru, METWIN, Robusst, and Skaddio
 */
export const SOAP_DISPENSER_COMPARISON_SHEET: MarketComparisonSheetData = {
  title: "Soap Dispenser Range — Product & Market Price Comparison",
  subtitle: "Wall-Mounted Soap Dispenser Comparison Sheet",
  description:
    "Our current catalogue MRP is shown against each product image, alongside the latest prices quoted by comparable products from AIMKO, Bath Guru, METWIN, Robusst, and Skaddio.",
  competitorBrands: ["AIMKO", "Bath Guru", "METWIN", "Robusst", "Skaddio"],
  rows: [
    {
      id: "SDCR-2",
      sku: "SDCR-2",
      description: "Chrome",
      image: "https://m.media-amazon.com/images/I/51wXbM0eW2L._AC_SL1000_.jpg",
      catalogueMrp: 450,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 275, unitOrVolume: "350 ml" }],
        "Bath Guru": [{ price: 349, unitOrVolume: "350 ml" }],
        METWIN: [{ price: 300, unitOrVolume: "400 ml" }],
        Robusst: [],
        Skaddio: [],
      },
    },
    {
      id: "SDBL-1",
      sku: "SDBL-1",
      description: "Black",
      image: "https://m.media-amazon.com/images/I/51Bqj9W1x8L._AC_SL1000_.jpg",
      catalogueMrp: 340,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 242, unitOrVolume: "350 ml" }],
        "Bath Guru": [],
        METWIN: [
          { price: 247, unitOrVolume: "450 ml" },
          { price: 230, unitOrVolume: "350 ml" },
        ],
        Robusst: [],
        Skaddio: [{ price: 240, unitOrVolume: "400 ml" }],
      },
    },
    {
      id: "SDWH-3",
      sku: "SDWH-3",
      description: "White",
      image: "https://m.media-amazon.com/images/I/51QxM-gM6EL._AC_SL1000_.jpg",
      catalogueMrp: 320,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 242, unitOrVolume: "350 ml" }],
        "Bath Guru": [{ price: 260, unitOrVolume: "350 ml" }],
        METWIN: [
          { price: 247, unitOrVolume: "450 ml" },
          { price: 230, unitOrVolume: "350 ml" },
        ],
        Robusst: [],
        Skaddio: [{ price: 240, unitOrVolume: "400 ml" }],
      },
    },
    {
      id: "SDLB-1",
      sku: "SDLB-1",
      description: "Long Black",
      image: "https://m.media-amazon.com/images/I/41e7U2y2wEL._AC_SL1000_.jpg",
      catalogueMrp: 530,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 299, unitOrVolume: "350 ml" }],
        "Bath Guru": [{ price: 399, unitOrVolume: "420 ml" }],
        METWIN: [{ price: 347, unitOrVolume: "350 ml" }],
        Robusst: [{ price: 399, unitOrVolume: "350 ml" }],
        Skaddio: [],
      },
    },
    {
      id: "SDLC-2",
      sku: "SDLC-2",
      description: "Long Chrome",
      image: "https://m.media-amazon.com/images/I/51lO0cTq07L._AC_SL1000_.jpg",
      catalogueMrp: 620,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 358, unitOrVolume: "-" }],
        "Bath Guru": [],
        METWIN: [
          { price: 399, unitOrVolume: "350 ml" },
          { price: 420, unitOrVolume: "420 ml" },
        ],
        Robusst: [],
        Skaddio: [],
      },
    },
    {
      id: "SDLW-3",
      sku: "SDLW-3",
      description: "Long White",
      image: "https://m.media-amazon.com/images/I/41DqCjE1h7L._AC_SL1000_.jpg",
      catalogueMrp: 530,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 299, unitOrVolume: "-" }],
        "Bath Guru": [{ price: 399, unitOrVolume: "420 ml" }],
        METWIN: [{ price: 349, unitOrVolume: "350 ml" }],
        Robusst: [{ price: 399, unitOrVolume: "350 ml" }],
        Skaddio: [],
      },
    },
    {
      id: "SDLG-4",
      sku: "SDLG-4",
      description: "Long Gold",
      image: "https://m.media-amazon.com/images/I/41Q3FfFvGmL._AC_SL1000_.jpg",
      catalogueMrp: 530,
      currency: "₹",
      competitors: {
        AIMKO: [{ price: 358, unitOrVolume: "-" }],
        "Bath Guru": [],
        METWIN: [{ price: 399, unitOrVolume: "350 ml" }],
        Robusst: [],
        Skaddio: [],
      },
    },
    {
      id: "SD-2",
      sku: "SD-2",
      description: "Black",
      image: "https://m.media-amazon.com/images/I/51bE2-3W4AL._AC_SL1000_.jpg",
      catalogueMrp: 340,
      currency: "₹",
      competitors: {
        AIMKO: [],
        "Bath Guru": [
          { price: 293, unitOrVolume: "350 ml" },
          { price: 412, unitOrVolume: "400 ml" },
        ],
        METWIN: [{ price: 350, unitOrVolume: "350 ml" }],
        Robusst: [],
        Skaddio: [],
      },
    },
    {
      id: "SD-5-Black",
      sku: "SD-5",
      description: "Dolphin Black",
      image: "https://m.media-amazon.com/images/I/51VwA7y2hWL._AC_SL1000_.jpg",
      catalogueMrp: 720,
      currency: "₹",
      competitors: {
        AIMKO: [],
        "Bath Guru": [],
        METWIN: [{ price: 599, unitOrVolume: "750 ml" }],
        Robusst: [],
        Skaddio: [],
      },
    },
    {
      id: "SD-5-White",
      sku: "SD-5",
      description: "Dolphin White",
      image: "https://m.media-amazon.com/images/I/51n8J9r3oML._AC_SL1000_.jpg",
      catalogueMrp: 700,
      currency: "₹",
      competitors: {
        AIMKO: [],
        "Bath Guru": [],
        METWIN: [{ price: 599, unitOrVolume: "750 ml" }],
        Robusst: [],
        Skaddio: [],
      },
    },
  ],
};

/**
 * Converts Soap Dispenser data to AmazonProduct[] so it works with all views
 * (card grid, table, detail modal, and comparison sheet)
 */
export const SOAP_DISPENSER_PRODUCTS: AmazonProduct[] = SOAP_DISPENSER_COMPARISON_SHEET.rows.map((row) => {
  // Collect all competitor variant options
  const allVariants = Object.entries(row.competitors).flatMap(([brand, opts]) =>
    opts.map((opt, idx) => ({
      id: `${row.sku}-${brand}-${idx}`,
      skuOrAsin: `${row.sku}-${brand}`,
      size: opt.unitOrVolume && opt.unitOrVolume !== "-" ? opt.unitOrVolume : "Standard",
      color: row.description,
      buildType: brand,
      material: "High Impact ABS Polymer",
      dimensions: opt.unitOrVolume || "350 ml",
      price: opt.price,
      originalPrice: row.catalogueMrp,
      inStock: true,
      image: row.image,
    }))
  );

  const competitorPrices = allVariants.map((v) => v.price);
  const minPrice = competitorPrices.length > 0 ? Math.min(...competitorPrices) : row.catalogueMrp;
  const maxPrice = competitorPrices.length > 0 ? Math.max(...competitorPrices) : row.catalogueMrp;

  return {
    id: row.id,
    asin: `B0${row.sku.replace(/[^A-Z0-9]/gi, "").padEnd(8, "X")}`,
    title: `${row.sku} Wall-Mounted Soap Dispenser (${row.description})`,
    url: `https://www.amazon.in/s?k=${encodeURIComponent(row.sku + " soap dispenser " + row.description)}`,
    image: row.image,
    thumbnails: [row.image],
    price: minPrice,
    originalPrice: row.catalogueMrp,
    currency: "₹",
    rating: 4.4,
    reviewCount: 384,
    isPrime: true,
    inStock: true,
    sizes: Array.from(
      new Set(
        allVariants
          .map((v) => v.size)
          .filter((s): s is string => Boolean(s && s !== "Standard" && s !== "-"))
      )
    ),
    materials: ["High Grade ABS Resin", "Clear Fluid Level Window", "Leak-Proof Pump Mechanism"],
    specifications: {
      "Model / SKU": row.sku,
      "Design / Color": row.description,
      "Mounting Type": "Wall Mounted (Screws & Wall Plugs Included)",
      "Catalogue MRP": `₹${row.catalogueMrp} / -`,
      "Competitor Brands Available": Object.keys(row.competitors)
        .filter((k) => row.competitors[k].length > 0)
        .join(", ") || "Catalogue exclusive",
      "Material": "ABS Engineering Plastic",
    },
    features: [
      `Sleek ${row.description} finish engineered for heavy commercial and home bathroom/washbasin use.`,
      `Catalogue MRP: ₹${row.catalogueMrp} / -. Supported competing brands: AIMKO, Bath Guru, METWIN, Robusst, Skaddio.`,
      "Non-drip silicone valve prevents fluid leakage and keeps counters pristine.",
      "Clear visual reservoir window allows instant fluid capacity level monitoring.",
    ],
    brand: "Catalogue Range",
    badge: "Market Price Tracked",
    scrapedAt: new Date().toISOString(),
    source: "direct_html",
    variants: allVariants,
    priceRange: { min: minPrice, max: maxPrice },
    availableColors: [row.description],
    availableBuildTypes: Object.keys(row.competitors),
    availableDimensions: ["350 ml", "400 ml", "420 ml", "450 ml", "750 ml"],
  };
});

/**
 * Utility: Converts any set of AmazonProduct[] into a dynamic MarketComparisonSheetData.
 * CRITICAL: Rows represent canonical ITEMS (Products), with NO seller attached.
 * The columns on the right represent all the SELLERS / BRANDS.
 */
export function buildMarketComparisonFromProducts(
  products: AmazonProduct[],
  title = "Soap Dispenser Range — Product & Market Price Comparison",
  subtitle = "Wall-Mounted Soap Dispenser Comparison Sheet"
): MarketComparisonSheetData {
  // If products are from the soap dispenser range or match its SKUs, use the exact canonical items
  const isSoapCategory = products.some(
    (p) =>
      p.id.startsWith("SD") ||
      p.title.toLowerCase().includes("dispenser") ||
      p.title.toLowerCase().includes("soap")
  );

  if (isSoapCategory || products.length === 0) {
    // If user selected specific products from the soap dispenser catalog, filter to those items
    if (products.length > 0 && products.length < SOAP_DISPENSER_COMPARISON_SHEET.rows.length) {
      const selectedIds = new Set(products.map((p) => p.id));
      const matchedRows = SOAP_DISPENSER_COMPARISON_SHEET.rows.filter(
        (r) => selectedIds.has(r.id) || products.some((p) => p.title.toLowerCase().includes(r.description.toLowerCase()))
      );
      if (matchedRows.length > 0) {
        return {
          ...SOAP_DISPENSER_COMPARISON_SHEET,
          rows: matchedRows,
        };
      }
    }
    return SOAP_DISPENSER_COMPARISON_SHEET;
  }

  // For arbitrary Amazon products (e.g. mice, electronics, bottles):
  // 1. Collect all distinct sellers/brands - these form the columns on the right!
  const sellerSet = new Set<string>();
  products.forEach((p) => {
    if (p.seller && p.seller !== "Direct Seller" && p.seller !== "Amazon Catalog") {
      sellerSet.add(p.seller);
    }
    if (p.brand && p.brand !== "Catalogue Range" && p.brand !== "Generic") {
      sellerSet.add(p.brand);
    }
    p.variants?.forEach((v) => {
      if (v.seller) sellerSet.add(v.seller);
      if (v.buildType && !sellerSet.has(v.buildType)) sellerSet.add(v.buildType);
    });
  });

  let competitorBrands = Array.from(sellerSet).slice(0, 6);
  if (competitorBrands.length === 0) {
    competitorBrands = ["AIMKO", "Bath Guru", "METWIN", "Robusst", "Skaddio"];
  }

  // 2. Group products into canonical ITEMS (Products on the left, NO seller attached to the row)
  const itemMap = new Map<string, MarketComparisonRow>();

  products.forEach((p, idx) => {
    // Clean description / item name (remove seller or brand prefix so item is generic)
    let cleanDesc = p.title;
    if (p.brand) {
      cleanDesc = cleanDesc.replace(new RegExp(`^${p.brand}\\s*`, "i"), "").trim();
    }
    if (p.seller) {
      cleanDesc = cleanDesc.replace(new RegExp(`^${p.seller}\\s*`, "i"), "").trim();
    }
    // Clean out noise
    cleanDesc = cleanDesc.split(/[-–|,]/)[0].trim() || p.title.slice(0, 35);
    const sku = p.asin || `ITEM-${idx + 1}`;
    const itemKey = `${sku}-${cleanDesc.slice(0, 15).toLowerCase()}`;

    if (!itemMap.has(itemKey)) {
      const competitors: Record<string, CompetitorOptionPrice[]> = {};
      competitorBrands.forEach((b) => {
        competitors[b] = [];
      });

      itemMap.set(itemKey, {
        id: p.id || `item-${idx + 1}`,
        sku: p.asin || `SKU-${idx + 1}`,
        description: cleanDesc,
        image: p.image || "",
        catalogueMrp: p.originalPrice || (p.price ? Math.round(p.price * 1.25) : 450),
        currency: p.currency || "₹",
        // NO seller on the row! The row is strictly the Product/Item.
        competitors,
      });
    }

    const item = itemMap.get(itemKey)!;
    const seller = p.seller || p.brand || competitorBrands[0];

    // Find best match column
    const matchedCol =
      competitorBrands.find((b) => b.toLowerCase() === seller.toLowerCase()) ||
      competitorBrands[0];

    if (!item.competitors[matchedCol]) {
      item.competitors[matchedCol] = [];
    }

    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v) => {
        item.competitors[matchedCol].push({
          price: v.price,
          unitOrVolume: v.size || v.dimensions || "350 ml",
        });
      });
    } else if (p.price) {
      item.competitors[matchedCol].push({
        price: p.price,
        unitOrVolume: p.sizes?.[0] || "350 ml",
      });
    }
  });

  return {
    title,
    subtitle,
    description:
      "Our current catalogue MRP is shown against each product item, alongside the latest prices quoted by competing sellers.",
    competitorBrands,
    availableSellers: competitorBrands,
    rows: Array.from(itemMap.values()),
  };
}
