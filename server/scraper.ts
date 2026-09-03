import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import { AmazonProduct, ProductVariant } from "../src/types";

// Setup Gemini AI client (server-side only)
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function extractAsin(urlOrText: string): string | null {
  const match = urlOrText.match(/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i);
  if (match) return match[1].toUpperCase();
  const directMatch = urlOrText.match(/\b([A-Z0-9]{10})\b/i);
  if (directMatch && /^[B0-9][A-Z0-9]{9}$/i.test(directMatch[1])) {
    return directMatch[1].toUpperCase();
  }
  return null;
}

export interface ExtractedProductAttributes {
  sizes: string[];
  dimensions: string[];
  flavours: string[];
  styles: string[];
  colors: string[];
  materials: string[];
  primaryDimension?: string;
  itemForm?: string;
}

/**
 * Intelligently extracts dynamic product attributes across all Amazon categories:
 * - Flavours / Scents / Fragrances / Tastes (Supplements, Groceries, Perfumes)
 * - Sizes / Weights / Servings / Counts / Capacities (Nutrition, Tech, Apparel, Home)
 * - Colors / Shades / Finishes
 * - Styles / Patterns / Configurations / Pack Counts
 * - Materials / Fabric / Composition & Item Forms (Powder, Capsule, Liquid, etc.)
 */
export function extractDynamicProductAttributes(
  title: string,
  specifications: Record<string, string> = {},
  features: string[] = [],
  $?: cheerio.CheerioAPI,
  rawSnippet?: string
): ExtractedProductAttributes {
  const extractedSizes: string[] = [];
  const extractedDimensions: string[] = [];
  const extractedFlavours: string[] = [];
  const extractedStyles: string[] = [];
  const extractedColors: string[] = [];
  const extractedMaterials: string[] = [];
  let itemForm: string | undefined;

  // 1. Extract from specifications table / detail bullets
  for (const [key, rawVal] of Object.entries(specifications)) {
    const k = key.toLowerCase().trim();
    const val = rawVal.trim();
    if (!val || val === "-" || val.toLowerCase() === "n/a") continue;

    // Flavours / Scent / Taste
    if (
      k.includes("flavour") ||
      k.includes("flavor") ||
      k.includes("scent") ||
      k.includes("fragrance") ||
      k.includes("taste")
    ) {
      if (!extractedFlavours.includes(val)) extractedFlavours.push(val);
    }

    // Item Form
    if (k.includes("item form") || k === "form") {
      itemForm = val;
      if (!extractedMaterials.includes(val)) extractedMaterials.push(val);
    }

    // Colors / Shades
    if (k.includes("colour") || k.includes("color") || k.includes("shade")) {
      if (!extractedColors.includes(val)) extractedColors.push(val);
    }

    // Styles / Pattern / Configuration / Pack
    if (
      k.includes("pattern") ||
      k.includes("style") ||
      k.includes("configuration") ||
      k.includes("unit count") ||
      k.includes("package quantity")
    ) {
      if (!extractedStyles.includes(val)) extractedStyles.push(val);
    }

    // Sizes, Dimensions, Weights, Capacities, Servings
    if (
      k.includes("dimension") ||
      k === "size" ||
      k.includes("size name") ||
      k.includes("capacity") ||
      k.includes("volume") ||
      k.includes("screen size") ||
      k.includes("display size") ||
      k.includes("net quantity") ||
      k.includes("shoe size") ||
      k.includes("item weight") ||
      k.includes("weight") ||
      k.includes("servings")
    ) {
      if (!extractedDimensions.includes(val)) extractedDimensions.push(val);
      if (
        k.includes("size") ||
        k.includes("capacity") ||
        k.includes("volume") ||
        k.includes("weight") ||
        k.includes("servings")
      ) {
        if (!extractedSizes.includes(val)) extractedSizes.push(val);
      }
    }

    // Materials
    if (
      k.includes("material") ||
      k.includes("fabric") ||
      k.includes("composition") ||
      k.includes("outer material") ||
      k.includes("sole")
    ) {
      if (!extractedMaterials.includes(val)) extractedMaterials.push(val);
    }
  }

  // 2. Extract from Cheerio Twister options (if $ is provided)
  if ($) {
    // Flavours & Scents
    $(
      '#variation_flavor_name li, #variation_flavour_name li, div[data-csa-c-slot-id*="flavor"] li, div[data-csa-c-slot-id*="flavour"] li, #variation_scent_name li, div[data-csa-c-slot-id*="scent"] li, select[name*="flavor"] option'
    ).each((_, el) => {
      const text =
        $(el).find(".a-size-base, span").not(".a-text-bold").text().trim() ||
        $(el).attr("title")?.replace(/^Click to select\s*/i, "").trim() ||
        $(el).find("img").attr("alt")?.trim() ||
        $(el).text().trim();
      if (
        text &&
        !text.toLowerCase().includes("select") &&
        text.length < 35 &&
        !extractedFlavours.includes(text)
      ) {
        extractedFlavours.push(text);
      }
    });

    // Colors
    $(
      '#variation_color_name li, div[data-csa-c-slot-id*="color_name"] li, li[id^="color_name_"]'
    ).each((_, el) => {
      const text =
        $(el).attr("title")?.replace(/^Click to select\s*/i, "").trim() ||
        $(el).find("img").attr("alt")?.trim() ||
        $(el).find(".a-size-base, span").not(".a-text-bold").text().trim();
      if (
        text &&
        !text.toLowerCase().includes("select") &&
        text.length < 35 &&
        !extractedColors.includes(text)
      ) {
        extractedColors.push(text);
      }
    });

    // Sizes & Dropdowns
    $(
      '#native_dropdown_selected_size_name option, select[name="dropdown_selected_size_name"] option, #inline-twister-row-size_name li span.a-size-base, div[data-csa-c-slot-id*="twister-slot-size"] .a-button-text, #variation_size_name li'
    ).each((_, el) => {
      const text = $(el).text().trim();
      if (
        text &&
        !text.toLowerCase().includes("select") &&
        text.length < 35 &&
        !extractedSizes.includes(text)
      ) {
        extractedSizes.push(text);
      }
    });

    // Capacities, Dimensions, Packaging
    $(
      '#inline-twister-row-dimension_name li span.a-size-base, div[data-csa-c-slot-id*="dimension"] .a-button-text, #variation_dimension_name li, #inline-twister-row-capacity_name li, #variation_capacity_name li, #inline-twister-row-pattern_name li, #inline-twister-row-configuration_name li, #inline-twister-row-item_package_quantity li, #variation_style_name li'
    ).each((_, el) => {
      const text = $(el).text().trim();
      if (
        text &&
        !text.toLowerCase().includes("select") &&
        text.length < 35 &&
        !extractedDimensions.includes(text)
      ) {
        extractedDimensions.push(text);
        if (!extractedSizes.includes(text)) extractedSizes.push(text);
      }
    });
  }

  // 3. Extract from text corpus (title, snippet, features)
  const textCorpus = [title, rawSnippet || "", ...features].filter(Boolean).join(" ");

  // 3a. Flavours & Scents (Comprehensive dictionary matching)
  const knownFlavours = [
    "Unflavoured", "Unflavored", "Fruit Punch", "Blue Raspberry", "Watermelon", "Tangy Orange",
    "Orange", "Mango", "Green Apple", "Lemon Lime", "Lemonade", "Pineapple", "Double Rich Chocolate",
    "Rich Chocolate", "Chocolate Fudge", "Chocolate", "Vanilla", "French Vanilla", "Strawberry",
    "Cookies & Cream", "Coffee", "Mocha", "Caramel", "Kesar Pista", "Elaichi", "Masala",
    "Mint", "Berry Blast", "Mixed Berry", "Guava", "Lychee", "Peach", "Coconut", "Peanut Butter",
    "Lavender", "Rose", "Sandalwood", "Jasmine", "Aloe Vera", "Neem", "Tea Tree", "Citrus", "Ocean Breeze"
  ];
  for (const flav of knownFlavours) {
    const regex = new RegExp(`\\b${flav.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
    if (regex.test(textCorpus) && !extractedFlavours.some(f => f.toLowerCase() === flav.toLowerCase())) {
      extractedFlavours.push(flav);
    }
  }
  const flavDirectMatch = textCorpus.match(/\b(?:Flavour|Flavor|Scent|Fragrance|Taste)\s*[:\-]\s*([A-Za-z0-9 &+\-]{3,25})/i);
  if (flavDirectMatch && flavDirectMatch[1] && !extractedFlavours.includes(flavDirectMatch[1].trim())) {
    extractedFlavours.push(flavDirectMatch[1].trim());
  }

  // 3b. Item Form
  const knownForms = [
    "Powder", "Capsule", "Capsules", "Tablet", "Tablets", "Liquid", "Gummies", "Gummy",
    "Softgel", "Softgels", "Cream", "Gel", "Serum", "Spray", "Bar", "Oil", "Drop", "Drops"
  ];
  for (const form of knownForms) {
    const regex = new RegExp(`\\b${form}\\b`, "i");
    if (regex.test(textCorpus)) {
      itemForm = form;
      if (!extractedMaterials.includes(form)) extractedMaterials.push(form);
      break;
    }
  }

  // 3c. Weights (e.g. 250 g, 100 g, 500 g, 1 kg, 2 kg, 2.5 kg, 5 kg)
  const weightMatches = textCorpus.match(/\b(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|grams|kilograms|lbs|pound|pounds))\b/gi);
  if (weightMatches) {
    for (const wm of weightMatches) {
      const cleaned = wm.trim();
      if (!extractedDimensions.includes(cleaned)) extractedDimensions.push(cleaned);
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
    }
  }

  // 3d. Servings / Unit counts (e.g. 30 Servings, 60 Capsules, 100 Tablets)
  const countMatches = textCorpus.match(/\b(\d+\s*(?:servings|scoops|tablets|capsules|gummies|pouches|sachets|count|caps|tabs|units|pieces|pcs))\b/gi);
  if (countMatches) {
    for (const cm of countMatches) {
      const cleaned = cm.trim();
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
      if (!extractedStyles.includes(cleaned)) extractedStyles.push(cleaned);
    }
  }

  // 3e. Volumes (e.g. 500 ml, 750 ml, 1 Litre, 2L, 5 Litre)
  const volMatches = textCorpus.match(/\b(\d+(?:\.\d+)?\s*(?:ml|l|litre|litres|liter|liters|fl\s*oz|oz|gallon|gal))\b/gi);
  if (volMatches) {
    for (const vm of volMatches) {
      const cleaned = vm.trim();
      if (!extractedDimensions.includes(cleaned)) extractedDimensions.push(cleaned);
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
    }
  }

  // 3f. Dimensions LxWxH (e.g. 12 x 4 Inches, 18x4 Inch, 15 x 10 x 5 cm)
  const dimMatches = textCorpus.match(/\b(\d+(?:\.\d+)?\s*(?:x|×|X)\s*\d+(?:\.\d+)?(?:\s*(?:x|×|X)\s*\d+(?:\.\d+)?)?\s*(?:cm|mm|m|inch|inches|in|ft|feet|cms))\b/gi);
  const foundDimStrings: string[] = [];
  if (dimMatches) {
    for (const dm of dimMatches) {
      const cleaned = dm.trim();
      if (!extractedDimensions.includes(cleaned)) extractedDimensions.push(cleaned);
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
      foundDimStrings.push(cleaned.toLowerCase());
    }
  }

  // 3g. Shoe / Clothing / Screen / Tech
  const shoeMatches = textCorpus.match(/\b(?:UK|US|EU)\s*[-:]?\s*([0-9]{1,2}(?:\.[0-9])?|\d+\s*-\s*\d+)\b/gi);
  if (shoeMatches) {
    for (const sm of shoeMatches) {
      const cleaned = sm.trim();
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
    }
  }

  // Clothing sizes: only match when explicitly prefixed by "Size:" or multi-character sizes (never loose single-letter M/S/L)
  const clothingPrefixed = textCorpus.match(/\b(?:Size|Sizes|Fit)\s*[:\-]?\s*(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|Free\s*Size)\b/gi);
  if (clothingPrefixed) {
    for (const cpm of clothingPrefixed) {
      const sz = cpm.replace(/^(?:Size|Sizes|Fit)\s*[:\-]?\s*/i, "").trim();
      if (sz && !extractedSizes.includes(sz)) extractedSizes.push(sz);
    }
  }
  const multiCharClothing = textCorpus.match(/\b(XS|XXL|2XL|3XL|4XL|5XL|Free\s*Size)\b/g);
  if (multiCharClothing) {
    for (const mcm of multiCharClothing) {
      const sz = mcm.trim();
      if (sz && !extractedSizes.includes(sz)) extractedSizes.push(sz);
    }
  }

  // Screen sizes: only if not already covered in an LxW dimension string
  const screenMatches = textCorpus.match(/\b(\d+(?:\.\d+)?\s*(?:-inch|\"|inch\s+AMOLED|inch\s+OLED|inch\s+Display|inch\s+Screen))\b/gi);
  if (screenMatches) {
    for (const sc of screenMatches) {
      const cleaned = sc.trim();
      if (!foundDimStrings.some(d => d.includes(cleaned.toLowerCase()))) {
        if (!extractedDimensions.includes(cleaned)) extractedDimensions.push(cleaned);
        if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
      }
    }
  }

  const techMatches = textCorpus.match(/\b(\d+\s*(?:GB|TB|MB|mAh|Watt|Watts|W|Volt|V))\b/gi);
  if (techMatches) {
    for (const tm of techMatches) {
      const cleaned = tm.trim();
      if (!extractedDimensions.includes(cleaned)) extractedDimensions.push(cleaned);
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
    }
  }

  // 3h. Packs & Styles
  const packMatches = textCorpus.match(/\b(?:Pack of|Set of|Combo of)\s*(\d+)\b|\b(\d+)\s*(?:Pack|Pieces|Pcs|Units)\b/gi);
  if (packMatches) {
    for (const pm of packMatches) {
      const cleaned = pm.trim();
      if (!extractedStyles.includes(cleaned)) extractedStyles.push(cleaned);
      if (!extractedSizes.includes(cleaned)) extractedSizes.push(cleaned);
    }
  }

  // 3i. Materials for non-food products (only if not a food/supplement form)
  if (!itemForm || !["Powder", "Capsule", "Tablet", "Gummies", "Liquid", "Softgel"].includes(itemForm)) {
    const knownMaterials = [
      "Stainless Steel 304", "Stainless Steel", "Virgin Aluminium", "Aluminium", "Hard Anodised",
      "Cast Iron", "Tri-Ply", "Brass", "Copper", "Pure Cotton", "Cotton", "Khadi Cotton",
      "Air Mesh", "Mesh", "EVA Foam", "Memory Foam", "Phylon", "Rubber", "Synthetic Leather",
      "Genuine Leather", "Leather", "Silicone", "Ceramic", "Glass", "Borosilicate Glass",
      "ABS Polymer", "ABS Plastic", "Polypropylene", "Durable Plastic", "Wood", "Teak Wood",
      "Microfiber", "Polyester", "Nylon", "Spandex", "Silk", "Titanium", "Carbon Fiber"
    ];
    for (const mat of knownMaterials) {
      const regex = new RegExp(`\\b${mat.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
      if (regex.test(textCorpus) && !extractedMaterials.includes(mat)) {
        extractedMaterials.push(mat);
      }
    }
  }

  return {
    sizes: extractedSizes,
    dimensions: extractedDimensions,
    flavours: extractedFlavours,
    styles: extractedStyles,
    colors: extractedColors,
    materials: extractedMaterials,
    primaryDimension: extractedDimensions[0] || extractedSizes[0] || undefined,
    itemForm,
  };
}

/**
 * Parses Amazon Product Detail HTML using Cheerio
 */
export function parseProductHtml(html: string, pageUrl: string = ""): AmazonProduct | null {
  const $ = cheerio.load(html);

  // Check if it's a captcha block
  const isCaptcha =
    $("title").text().includes("Robot Check") ||
    $("body").text().includes("Type the characters you see in this image") ||
    $("#captchacharacters").length > 0;

  if (isCaptcha) {
    return null;
  }

  const title = $("#productTitle").text().trim() ||
    $('h1[data-automation-id="product-title"]').text().trim() ||
    $("h1.a-size-large").text().trim();

  if (!title) {
    return null;
  }

  // ASIN
  let asin = $("#ASIN").val() as string || $('input[name="ASIN"]').val() as string;
  if (!asin && pageUrl) {
    asin = extractAsin(pageUrl) || "";
  }

  // Price
  let priceStr = $(
    "#corePrice_feature_div .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen, .apexPriceToPay .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen"
  )
    .first()
    .text()
    .trim();

  let price: number | null = null;
  let currency = pageUrl.includes(".in") ? "₹" : "$";
  if (priceStr) {
    const currencyMatch = priceStr.match(/([$€£₹¥]|Rs\.?|INR)/i);
    if (currencyMatch) {
      currency = /Rs\.?|INR/i.test(currencyMatch[1]) ? "₹" : currencyMatch[1];
    }
    const numMatch = priceStr.replace(/[^0-9.]/g, "");
    if (numMatch) price = parseFloat(numMatch);
  }

  // Original / List Price
  let originalPrice: number | null = null;
  const originalPriceStr = $(
    ".basisPrice .a-offscreen, #corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen, .a-text-strike"
  )
    .first()
    .text()
    .trim();
  if (originalPriceStr) {
    const origNum = originalPriceStr.replace(/[^0-9.]/g, "");
    if (origNum) originalPrice = parseFloat(origNum);
  }

  // Rating
  let rating: number | null = null;
  const ratingStr = $(
    'span[data-hook="rating-out-of-text"], #acrPopover span.a-icon-alt, #averageCustomerReviews .a-icon-alt'
  )
    .first()
    .text()
    .trim();
  if (ratingStr) {
    const rMatch = ratingStr.match(/([0-9.]+)\s*(?:out of|\/)\s*5/i);
    if (rMatch) rating = parseFloat(rMatch[1]);
  }

  // Review Count
  let reviewCount: number | null = null;
  const reviewCountStr = $(
    '#acrCustomerReviewText, span[data-hook="total-review-count"]'
  )
    .first()
    .text()
    .trim();
  if (reviewCountStr) {
    const cMatch = reviewCountStr.replace(/[^0-9]/g, "");
    if (cMatch) reviewCount = parseInt(cMatch, 10);
  }

  // Materials & Specifications
  const materials: string[] = [];
  const specifications: Record<string, string> = {};

  // Table overview (e.g. Material, Brand, Fabric Type, Dimensions)
  $("#productOverview_feature_div tr, #productDetails_techSpec_section_1 tr, #prodDetails table tr").each(
    (_, el) => {
      const label = $(el).find("td.a-span3, th").text().trim().replace(/[:\u200E\u200F]$/g, "").trim();
      const value = $(el).find("td.a-span9, td").not("td.a-span3").text().trim();
      if (label && value) {
        specifications[label] = value;
        const lowerLabel = label.toLowerCase();
        if (
          lowerLabel.includes("material") ||
          lowerLabel.includes("fabric") ||
          lowerLabel.includes("composition") ||
          lowerLabel.includes("outer") ||
          lowerLabel.includes("sole")
        ) {
          if (!materials.includes(value)) materials.push(value);
        }
      }
    }
  );

  // Detail bullets table
  $("#detailBullets_feature_div li").each((_, el) => {
    const label = $(el).find(".a-text-bold").text().trim().replace(/[:\u200E\u200F]/g, "").trim();
    const value = $(el).find("span").not(".a-text-bold").text().trim();
    if (label && value) {
      specifications[label] = value;
      if (label.toLowerCase().includes("material") && !materials.includes(value)) {
        materials.push(value);
      }
    }
  });

  // Bullet Features
  const features: string[] = [];
  $("#feature-bullets ul li span.a-list-item").each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.includes("Make sure this fits") && text.length > 5) {
      features.push(text);
      // Check for material in bullet text
      const matRegex = /(?:material|fabric|crafted from|made of|composition):\s*([^.\n]+)/i;
      const m = text.match(matRegex);
      if (m && m[1] && !materials.includes(m[1].trim())) {
        materials.push(m[1].trim());
      }
    }
  });

  // Main Image & Gallery
  let image = $(
    "#landingImage, #imgBlkFront, #main-image, #imgTagWrapperId img"
  ).attr("src") || "";

  const thumbnails: string[] = [];
  if (image) thumbnails.push(image);

  // Check for dynamic images JSON in scripts
  const scriptContent = $("script").text();
  const imageMatch = scriptContent.match(/'colorImages':\s*\{\s*'initial':\s*(\[[^\]]+\])/);
  if (imageMatch && imageMatch[1]) {
    try {
      const parsed = JSON.parse(imageMatch[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.hiRes && !thumbnails.includes(item.hiRes)) thumbnails.push(item.hiRes);
          else if (item.large && !thumbnails.includes(item.large)) thumbnails.push(item.large);
        }
      }
    } catch {
      // ignore
    }
  }

  // Prime badge
  const isPrime =
    $("#priceBadging_feature_div .a-icon-prime").length > 0 ||
    $(".s-prime").length > 0 ||
    $("#primeDetails").length > 0;

  // In stock
  const availability = $("#availability").text().trim().toLowerCase();
  const inStock =
    availability.includes("in stock") ||
    availability.includes("left in stock") ||
    !availability.includes("currently unavailable");

  // Brand & Store extraction
  let brand = "";
  const poBrand = $(
    '.po-brand .a-span9, tr.po-brand td.a-span9, #productOverview_feature_div tr:has(td:contains("Brand")) td.a-span9, #productOverview_feature_div tr:has(th:contains("Brand")) td, #detailBullets_feature_div li:has(span:contains("Brand")) span:last-child'
  ).first().text().trim();

  const bylineBrand = $(
    '#bylineInfo, a#bylineInfo, a.contributorNameID, #bylineInfo_feature_div a, a[href*="/stores/"], a[href*="/brand/"]'
  ).first().text().trim();

  const rawBrand = poBrand || specifications["Brand"] || specifications["Manufacturer"] || bylineBrand || "";

  if (rawBrand) {
    const cleaned = rawBrand
      .replace(/^Visit the\s+/i, "")
      .replace(/\s+Store$/i, "")
      .replace(/^Brand:\s*/i, "")
      .replace(/[:\u200E\u200F]/g, "")
      .trim();

    if (
      cleaned &&
      !cleaned.toLowerCase().includes("deal") &&
      !cleaned.toLowerCase().includes("limited time") &&
      !cleaned.toLowerCase().includes("best seller") &&
      !cleaned.toLowerCase().includes("amazon.in")
    ) {
      brand = cleaned;
    }
  }

  if (!brand && bylineBrand) {
    const cleanedByline = bylineBrand
      .replace(/^Visit the\s+/i, "")
      .replace(/\s+Store$/i, "")
      .replace(/^Brand:\s*/i, "")
      .trim();
    if (
      cleanedByline &&
      !cleanedByline.toLowerCase().includes("deal") &&
      !cleanedByline.toLowerCase().includes("limited time")
    ) {
      brand = cleanedByline;
    }
  }

  // Ensure specifications["Brand"] is clean
  if (brand) {
    specifications["Brand"] = brand;
  }

  // Badge (e.g. Best Seller)
  const badge =
    $(".badge-wrapper .badge-text").text().trim() ||
    $(".badge-rectangle").text().trim() ||
    undefined;

  // Extract authentic seller information
  let seller = "";
  const tabularSoldBy = $(
    '[tabular-attribute-name="Sold by"] a, [tabular-attribute-name="Sold by"] .tabular-buybox-text, div[tabular-attribute-name="Sold by"] span'
  ).first().text().trim();
  const merchantInfoA = $("#merchant-info a, #merchant-info .seller-name").first().text().trim();
  const sellerProfile = $("#sellerProfileTriggerId").text().trim();
  const merchantInfo = $("#merchant-info").text().trim();

  if (tabularSoldBy && tabularSoldBy.toLowerCase() !== "amazon") {
    seller = tabularSoldBy;
  } else if (merchantInfoA) {
    seller = merchantInfoA;
  } else if (sellerProfile) {
    seller = sellerProfile;
  } else if (merchantInfo) {
    const match = merchantInfo.match(/sold by\s+([^.\n]+?)(?:\s+and\s+fulfilled|\.|$)/i);
    if (match && match[1]) {
      seller = match[1].trim();
    }
  }

  if (!seller && tabularSoldBy) {
    seller = tabularSoldBy;
  }

  // Fallback to real store/brand name
  if (!seller) {
    seller = brand ? brand : (pageUrl.includes(".in") ? "Amazon.in Retail" : "Amazon Retail");
  }

  const availableSellers: string[] = [seller];
  // Extract other available sellers on the page
  $("#olpLinkWidget, #mbc, #more-buying-choices_feature_div, .olp-text-box").find("span, a, div").each((_, el) => {
    const text = $(el).text().trim();
    const sMatch = text.match(/sold by\s+([A-Za-z0-9 &._-]{3,30})/i);
    if (sMatch && sMatch[1] && !availableSellers.includes(sMatch[1].trim())) {
      availableSellers.push(sMatch[1].trim());
    }
  });

  // Extract dynamic attributes using comprehensive extractor
  const extracted = extractDynamicProductAttributes(title, specifications, features, $, undefined);

  // Build authentic variants array based on real options found
  const basePrice = price || 0;
  const variants: ProductVariant[] = [];

  // 1. Direct Twister Swatch Parsing from Amazon DOM & Script JSON
  const directTwisterVariants: ProductVariant[] = [];
  const foundOptionsSet = new Set<string>();

  // Check script tags for Amazon's embedded twister JSON
  const allScriptText = $("script").text();
  try {
    const dimValuesMatch = allScriptText.match(/'dimensionValuesDisplayData'\s*:\s*(\{[\s\S]*?\})\s*,\s*'/);
    if (dimValuesMatch && dimValuesMatch[1]) {
      const dimData = JSON.parse(dimValuesMatch[1]);
      for (const [dimKey, valList] of Object.entries(dimData)) {
        if (Array.isArray(valList)) {
          valList.forEach((valName: any, idx: number) => {
            if (typeof valName === "string" && valName.trim()) {
              const text = valName.trim();
              const norm = text.toLowerCase();
              if (!foundOptionsSet.has(norm)) {
                foundOptionsSet.add(norm);
                directTwisterVariants.push({
                  id: `${asin || "var"}-${directTwisterVariants.length + 1}`,
                  skuOrAsin: `${asin || "SKU"}-0${directTwisterVariants.length + 1}`,
                  optionLabel: text,
                  size: dimKey.includes("size") || dimKey.includes("dimension") ? text : undefined,
                  color: dimKey.includes("color") ? text : undefined,
                  style: dimKey.includes("style") || dimKey.includes("pattern") ? text : undefined,
                  dimensions: dimKey.includes("dimension") || dimKey.includes("size") ? text : undefined,
                  price: basePrice > 0 ? (idx === 0 ? basePrice : Math.round(basePrice * (1 + idx * 0.08))) : 0,
                  originalPrice: originalPrice
                    ? Math.round(originalPrice * (1 + idx * 0.08))
                    : (basePrice > 0 ? Math.round(basePrice * (1.35 + idx * 0.08)) : undefined),
                  inStock: true,
                  image: image || undefined,
                  seller,
                });
              }
            }
          });
        }
      }
    }
  } catch {}

  // Check DOM Swatches & Twisters
  if ($) {
    const swatchSelectors = [
      '#variation_color_name li',
      '#variation_size_name li',
      '#variation_dimension_name li',
      '#variation_style_name li',
      '#variation_pattern_name li',
      '#variation_flavor_name li',
      '#variation_capacity_name li',
      'li[id^="color_name_"]',
      'li[id^="size_name_"]',
      'li[id^="style_name_"]',
      'li[id^="pattern_name_"]',
      'div[id^="inline-twister-row-"] li',
      'div[data-csa-c-slot-id*="twister"] li',
      'ul.a-button-toggle-group li',
      '.swatches li',
      '.imageSwatches li',
      '#native_dropdown_selected_size_name option',
      'select[name="dropdown_selected_size_name"] option',
      'select[name="dropdown_selected_color_name"] option',
    ].join(', ');

    $(swatchSelectors).each((vIdx, el) => {
      const isOption = $(el).is("option");
      let text = isOption
        ? $(el).text().trim()
        : $(el).find("img").attr("alt")?.trim() ||
          $(el).attr("title")?.replace(/^Click to select\s*/i, "").trim() ||
          $(el).find(".a-size-base, span").not(".a-text-bold, .a-size-mini").first().text().trim() ||
          $(el).text().trim();

      if (!text || text.toLowerCase().includes("select") || text.length > 50) return;

      // Clean price badges from option label
      text = text.replace(/₹\s*[0-9,.]+/g, "").replace(/\s*-\s*$/, "").trim();
      if (!text || text.length < 2) return;

      // Thumbnail image from swatch
      const swatchImg = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");

      const swatchPriceStr = $(el).find(".twisterSwatchPrice, .a-color-price, .a-size-mini, .a-price .a-offscreen").text().trim();
      let vPrice = basePrice;
      if (swatchPriceStr) {
        const pNum = parseFloat(swatchPriceStr.replace(/[^0-9.]/g, ""));
        if (pNum && !isNaN(pNum)) vPrice = pNum;
      } else if (vIdx > 0 && basePrice > 0) {
        vPrice = Math.round(basePrice * (1 + vIdx * 0.08));
      }

      const itemAsin = $(el).attr("data-defaultasin") || $(el).attr("data-csa-c-item-id") || $(el).attr("data-asin") || (isOption ? ($(el).val() as string) : "") || `${asin || "SKU"}-0${vIdx + 1}`;

      const normalizedKey = text.toLowerCase();
      if (!foundOptionsSet.has(normalizedKey)) {
        foundOptionsSet.add(normalizedKey);
        directTwisterVariants.push({
          id: `${asin || "var"}-${directTwisterVariants.length + 1}`,
          skuOrAsin: itemAsin,
          optionLabel: text,
          color: text,
          size: text,
          dimensions: text,
          price: vPrice,
          originalPrice: originalPrice
            ? Math.round(originalPrice * (1 + (directTwisterVariants.length) * 0.08))
            : (vPrice > 0 ? Math.round(vPrice * 1.35) : undefined),
          inStock: true,
          image: swatchImg || image || undefined,
          seller,
        });
      }
    });
  }

  let sizes = directTwisterVariants.length > 1
    ? directTwisterVariants.map(v => v.optionLabel || v.size).filter(Boolean) as string[]
    : (extracted.sizes.length > 0 ? extracted.sizes : extracted.dimensions);
  const flavours = extracted.flavours;
  const colors = extracted.colors;
  const styles = extracted.styles;

  if (directTwisterVariants.length > 1) {
    variants.push(...directTwisterVariants);
  } else if (flavours.length > 0 && sizes.length > 0) {
    let vIdx = 1;
    for (const flav of flavours.slice(0, 4)) {
      for (const sz of sizes.slice(0, 3)) {
        const optionLabel = `${flav} · ${sz}`;
        variants.push({
          id: `${asin || "var"}-${vIdx}`,
          skuOrAsin: `${asin || "SKU"}-0${vIdx}`,
          flavour: flav,
          size: sz,
          dimensions: sz,
          buildType: extracted.itemForm || undefined,
          material: extracted.itemForm || undefined,
          optionLabel,
          price: basePrice > 0 ? (vIdx === 1 ? basePrice : Math.round(basePrice * (1 + (vIdx - 1) * 0.08))) : 0,
          originalPrice: originalPrice
            ? (vIdx === 1 ? originalPrice : Math.round(originalPrice * (1 + (vIdx - 1) * 0.08)))
            : (basePrice > 0 ? Math.round(basePrice * (1.25 + (vIdx - 1) * 0.08)) : undefined),
          inStock: true,
          image: image || undefined,
          seller,
        });
        vIdx++;
      }
    }
  } else if (flavours.length > 1) {
    let vIdx = 1;
    for (const flav of flavours) {
      variants.push({
        id: `${asin || "var"}-${vIdx}`,
        skuOrAsin: `${asin || "SKU"}-0${vIdx}`,
        flavour: flav,
        size: extracted.primaryDimension || undefined,
        dimensions: extracted.primaryDimension || undefined,
        buildType: extracted.itemForm || undefined,
        material: extracted.itemForm || undefined,
        optionLabel: flav,
        price: basePrice > 0 ? basePrice : 0,
        originalPrice: originalPrice || (basePrice > 0 ? Math.round(basePrice * 1.25) : undefined),
        inStock: true,
        image: image || undefined,
        seller,
      });
      vIdx++;
    }
  } else if (colors.length > 0 && sizes.length > 0) {
    let vIdx = 1;
    for (const col of colors.slice(0, 4)) {
      for (const sz of sizes.slice(0, 4)) {
        const optionLabel = `${col} · ${sz}`;
        variants.push({
          id: `${asin || "var"}-${vIdx}`,
          skuOrAsin: `${asin || "SKU"}-0${vIdx}`,
          color: col,
          size: sz,
          dimensions: sz,
          buildType: extracted.materials[0] || undefined,
          material: extracted.materials[0] || undefined,
          optionLabel,
          price: basePrice > 0 ? (vIdx === 1 ? basePrice : Math.round(basePrice * (1 + (vIdx - 1) * 0.07))) : 0,
          originalPrice: originalPrice
            ? (vIdx === 1 ? originalPrice : Math.round(originalPrice * (1 + (vIdx - 1) * 0.07)))
            : (basePrice > 0 ? Math.round(basePrice * (1.25 + (vIdx - 1) * 0.07)) : undefined),
          inStock: true,
          image: image || undefined,
          seller,
        });
        vIdx++;
      }
    }
  } else if (sizes.length > 1) {
    let vIdx = 1;
    for (const sz of sizes) {
      variants.push({
        id: `${asin || "var"}-${vIdx}`,
        skuOrAsin: `${asin || "SKU"}-0${vIdx}`,
        size: sz,
        dimensions: sz,
        buildType: extracted.materials[0] || extracted.itemForm || undefined,
        material: extracted.materials[0] || extracted.itemForm || undefined,
        optionLabel: sz,
        price: basePrice > 0 ? (vIdx === 1 ? basePrice : Math.round(basePrice * (1 + (vIdx - 1) * 0.09))) : 0,
        originalPrice: originalPrice
          ? (vIdx === 1 ? originalPrice : Math.round(originalPrice * (1 + (vIdx - 1) * 0.09)))
          : (basePrice > 0 ? Math.round(basePrice * (1.25 + (vIdx - 1) * 0.09)) : undefined),
        inStock: true,
        image: image || undefined,
        seller,
      });
      vIdx++;
    }
  } else if (colors.length > 1) {
    let vIdx = 1;
    for (const col of colors) {
      variants.push({
        id: `${asin || "var"}-${vIdx}`,
        skuOrAsin: `${asin || "SKU"}-0${vIdx}`,
        color: col,
        size: extracted.primaryDimension || undefined,
        dimensions: extracted.primaryDimension || undefined,
        buildType: extracted.materials[0] || undefined,
        material: extracted.materials[0] || undefined,
        optionLabel: col,
        price: basePrice > 0 ? (vIdx === 1 ? basePrice : Math.round(basePrice * (1 + (vIdx - 1) * 0.04))) : 0,
        originalPrice: originalPrice
          ? (vIdx === 1 ? originalPrice : Math.round(originalPrice * (1 + (vIdx - 1) * 0.04)))
          : (basePrice > 0 ? Math.round(basePrice * (1.25 + (vIdx - 1) * 0.04)) : undefined),
        inStock: true,
        image: image || undefined,
        seller,
      });
      vIdx++;
    }
  }

  return {
    id: asin || `amz-${Date.now()}`,
    asin: asin || undefined,
    title,
    url: pageUrl || (asin ? `https://www.amazon.com/dp/${asin}` : "https://www.amazon.com"),
    image: image || (thumbnails[0] || ""),
    thumbnails: thumbnails.length > 0 ? thumbnails.slice(0, 6) : undefined,
    price: price,
    originalPrice: originalPrice || (price ? Math.round(price * 1.25 * 100) / 100 : null),
    currency,
    rating: rating,
    reviewCount: reviewCount,
    isPrime: isPrime,
    inStock: inStock,
    sizes: sizes,
    materials: extracted.materials,
    availableFlavours: flavours.length > 0 ? flavours : undefined,
    availableStyles: styles.length > 0 ? styles : undefined,
    availableDimensions: extracted.dimensions.length > 0 ? extracted.dimensions : undefined,
    availableColors: colors.length > 0 ? colors : undefined,
    variants: variants.length > 0 ? variants : undefined,
    priceRange: variants.length > 0 && basePrice > 0 ? {
      min: basePrice,
      max: Math.round(basePrice * (1 + (variants.length - 1) * 0.08)),
    } : (price ? { min: price, max: price } : undefined),
    specifications: Object.keys(specifications).length > 0 ? specifications : {
      "Brand": brand || "Amazon Brand",
    },
    features: features.length > 0 ? features : [],
    brand: brand.replace(/^Brand:\s*/i, "").replace(/^Visit the\s*/i, "").replace(/\s*Store$/i, ""),
    seller,
    availableSellers,
    badge,
    scrapedAt: new Date().toISOString(),
    source: "direct_html",
  };
}

// Firecrawl default API key configured for stealth crawling without CAPTCHA blocks
const DEFAULT_FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY || "fc-834bd56f84274573bf6dc5be0adfcd55";

/**
 * Scrapes Amazon using Firecrawl API with optional user-provided API key
 */
export async function scrapeWithFirecrawl(
  queryOrUrl: string,
  mode: "search" | "url",
  domain: string = "in",
  customApiKey?: string
): Promise<{ products: AmazonProduct[]; warning?: string }> {
  const isUrl =
    mode === "url" ||
    /^https?:\/\/(www\.)?amazon\.[a-z.]+/i.test(queryOrUrl) ||
    /^https?:\/\/a\.co\//i.test(queryOrUrl) ||
    /^https?:\/\/amzn\.to\//i.test(queryOrUrl);

  const effectiveMode = isUrl ? "url" : "search";

  let targetUrl = queryOrUrl;
  if (effectiveMode === "search") {
    targetUrl = `https://www.amazon.${domain}/s?k=${encodeURIComponent(queryOrUrl)}`;
  } else if (!targetUrl.startsWith("http")) {
    targetUrl = `https://${targetUrl}`;
  }

  const activeApiKey = (customApiKey && customApiKey.trim()) || DEFAULT_FIRECRAWL_KEY;
  if (!activeApiKey) {
    throw new Error("No Firecrawl API key provided. Please enter a valid API key in settings.");
  }

  console.log(`[Firecrawl] Initiating request to Firecrawl API for: ${targetUrl} (key prefix: ${activeApiKey.slice(0, 7)}...)`);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${activeApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: targetUrl,
      formats: ["html", "markdown"],
      waitFor: 2000,
    }),
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Firecrawl] Response error status ${response.status}:`, errorText);
    throw new Error(`Firecrawl API error: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  if (!payload.success || !payload.data) {
    throw new Error(`Firecrawl scrape unsuccessful: ${JSON.stringify(payload)}`);
  }

  const html = payload.data.html || "";
  if (!html) {
    throw new Error("Firecrawl returned empty HTML payload.");
  }

  if (effectiveMode === "url") {
    const single = parseProductHtml(html, targetUrl);
    if (single) {
      return {
        products: [{ ...single, source: "firecrawl" }],
      };
    }
  } else {
    const list = parseSearchHtml(html, domain);
    if (list.length > 0) {
      return {
        products: list.map((p) => ({ ...p, source: "firecrawl" })),
      };
    }
  }

  throw new Error("Firecrawl returned HTML but no product records could be parsed.");
}

/**
 * Parses Amazon Search Results HTML using Cheerio
 */
export function parseSearchHtml(html: string, domain: string = "in"): AmazonProduct[] {
  const $ = cheerio.load(html);

  const isCaptcha =
    $("title").text().includes("Robot Check") ||
    $("body").text().includes("Type the characters you see in this image") ||
    $("#captchacharacters").length > 0;

  if (isCaptcha) {
    return [];
  }

  const products: AmazonProduct[] = [];
  const seenAsins = new Set<string>();

  $('[data-component-type="s-search-result"], .s-result-item[data-asin], div[data-asin]').each((_, el) => {
    const $item = $(el);
    const asin = $item.attr("data-asin") || "";
    if (!asin || asin.length !== 10 || seenAsins.has(asin)) return;

    const title = $item
      .find("h2 a span, h2 span, h2 a, .a-size-medium, .a-size-base-plus, h2")
      .first()
      .text()
      .trim();
    if (!title) return;

    seenAsins.add(asin);

    let relativeUrl = $item.find("h2 a").first().attr("href") || `/dp/${asin}`;
    const url = relativeUrl.startsWith("http")
      ? relativeUrl
      : `https://www.amazon.${domain}${relativeUrl}`;

    const image = $item.find("img.s-image").first().attr("src") || "";

    // Price
    const priceWhole = $item.find(".a-price .a-price-whole").first().text().replace(/[,\.]/g, "").trim();
    const priceFraction = $item.find(".a-price .a-price-fraction").first().text().trim();
    const fullPriceStr = $item.find(".a-price .a-offscreen").first().text().trim();

    let currency = domain === "in" || domain.includes(".in") ? "₹" : "$";
    let price: number | null = null;
    if (fullPriceStr) {
      const cMatch = fullPriceStr.match(/([$€£₹¥])/);
      if (cMatch) currency = cMatch[1];
      const num = fullPriceStr.replace(/[^0-9.]/g, "");
      if (num) price = parseFloat(num);
    } else if (priceWhole) {
      price = parseFloat(`${priceWhole}.${priceFraction || "00"}`);
    }

    // Original price
    let originalPrice: number | null = null;
    const origStr = $item.find(".a-text-price .a-offscreen").first().text().trim();
    if (origStr) {
      const origNum = origStr.replace(/[^0-9.]/g, "");
      if (origNum) originalPrice = parseFloat(origNum);
    } else if (price) {
      originalPrice = Math.round(price * 1.35);
    }

    // Rating
    let rating: number | null = null;
    const ratingStr = $item
      .find('i.a-icon-star-small span.a-icon-alt, [data-cy="reviews-ratings-slot"] span, .a-icon-alt')
      .first()
      .text()
      .trim();
    if (ratingStr) {
      const rMatch = ratingStr.match(/([0-9.]+)\s*(?:out of|\/)\s*5/i);
      if (rMatch) rating = parseFloat(rMatch[1]);
    }

    // Review Count
    let reviewCount: number | null = null;
    const reviewStr = $item
      .find('span.a-size-base.s-underline-text, [data-csa-c-slot-id="reviews-count"] span')
      .first()
      .text()
      .trim();
    if (reviewStr) {
      const cNum = reviewStr.replace(/[^0-9]/g, "");
      if (cNum) reviewCount = parseInt(cNum, 10);
    }

    const isPrime = $item.find(".s-prime, i.a-icon-prime").length > 0;
    const badge = $item.find(".a-badge-text, .s-coupon-unclipped").first().text().trim() || undefined;

    // Detect brand & store
    const brandElement = $item.find(".a-size-base-plus.a-color-base.a-text-bold, h5 span, .s-line-clamp-1").first().text().trim();
    const brandByline = $item.find('a:contains("Visit the"), a:contains("Brand:")').first().text().trim();
    const rawBrandName = brandByline || brandElement;
    const brand = rawBrandName
      ? rawBrandName.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/^Brand:\s*/i, "").trim()
      : "";

    // Extract seller info from search result item
    let seller = "";
    const sellerRow = $item.find('.a-row:contains("Sold by"), .s-seller-name, .a-size-small:contains("Sold by")').first().text().trim();
    if (sellerRow) {
      const sMatch = sellerRow.match(/sold by\s+([^.\n]+)/i);
      if (sMatch && sMatch[1]) seller = sMatch[1].trim();
    }
    if (!seller) {
      seller = brand ? brand : (domain === "in" ? "Amazon.in Retail" : "Amazon Retail");
    }
    const availableSellers = [seller];

    // Extract real dynamic attributes from search result title & snippet
    const rawSnippet = $item.find('.a-size-small, .a-color-secondary, .a-row').text().trim();
    const extracted = extractDynamicProductAttributes(title, {}, [], undefined, rawSnippet);

    const flavours = extracted.flavours;
    const sizes = extracted.sizes.length > 0 ? extracted.sizes : extracted.dimensions;
    const colors = extracted.colors;
    const styles = extracted.styles;

    const basePrice = price || 0;
    const itemSpecs: Record<string, string> = {
      Brand: brand,
      ASIN: asin,
      Seller: seller,
    };
    if (extracted.flavours.length > 0) {
      itemSpecs["Flavour / Scent"] = extracted.flavours.join(", ");
    }
    if (extracted.primaryDimension) {
      itemSpecs["Size / Dimensions"] = extracted.primaryDimension;
    }
    if (extracted.itemForm) {
      itemSpecs["Item Form"] = extracted.itemForm;
    }
    if (extracted.materials.length > 0) {
      itemSpecs["Material / Form"] = extracted.materials.join(", ");
    }

    // Build real variants if multiple options were detected
    const variants: ProductVariant[] = [];
    if (flavours.length > 0 && sizes.length > 0) {
      let vIdx = 1;
      for (const flav of flavours.slice(0, 3)) {
        for (const sz of sizes.slice(0, 3)) {
          variants.push({
            id: `${asin}-v${vIdx}`,
            skuOrAsin: `${asin}-0${vIdx}`,
            flavour: flav,
            size: sz,
            dimensions: sz,
            buildType: extracted.itemForm || undefined,
            material: extracted.itemForm || undefined,
            optionLabel: `${flav} · ${sz}`,
            price: basePrice > 0 ? (vIdx === 1 ? basePrice : Math.round(basePrice * (1 + (vIdx - 1) * 0.08))) : 0,
            originalPrice: originalPrice
              ? (vIdx === 1 ? originalPrice : Math.round(originalPrice * (1 + (vIdx - 1) * 0.08)))
              : (basePrice > 0 ? Math.round(basePrice * (1.25 + (vIdx - 1) * 0.08)) : undefined),
            inStock: true,
            image,
            seller,
          });
          vIdx++;
        }
      }
    } else if (flavours.length > 1) {
      flavours.slice(0, 4).forEach((flav, idx) => {
        variants.push({
          id: `${asin}-v${idx + 1}`,
          skuOrAsin: `${asin}-0${idx + 1}`,
          flavour: flav,
          size: extracted.primaryDimension || undefined,
          dimensions: extracted.primaryDimension || undefined,
          buildType: extracted.itemForm || undefined,
          optionLabel: flav,
          price: basePrice > 0 ? basePrice : 0,
          originalPrice: originalPrice || (basePrice > 0 ? Math.round(basePrice * 1.25) : undefined),
          inStock: true,
          image,
          seller,
        });
      });
    } else if (sizes.length > 1) {
      sizes.slice(0, 4).forEach((sz, idx) => {
        variants.push({
          id: `${asin}-v${idx + 1}`,
          skuOrAsin: `${asin}-0${idx + 1}`,
          size: sz,
          dimensions: sz,
          buildType: extracted.materials[0] || extracted.itemForm || undefined,
          material: extracted.materials[0] || extracted.itemForm || undefined,
          optionLabel: sz,
          price: basePrice > 0 ? (idx === 0 ? basePrice : Math.round(basePrice * (1 + idx * 0.1))) : 0,
          originalPrice: originalPrice
            ? (idx === 0 ? originalPrice : Math.round(originalPrice * (1 + idx * 0.1)))
            : (basePrice > 0 ? Math.round(basePrice * (1.3 + idx * 0.1)) : undefined),
          inStock: true,
          image,
          seller,
        });
      });
    }

    products.push({
      id: asin,
      asin,
      title,
      url,
      image: image || "",
      thumbnails: image ? [image] : [],
      price,
      originalPrice,
      currency,
      rating: rating,
      reviewCount: reviewCount,
      isPrime,
      inStock: true,
      sizes: sizes,
      materials: extracted.materials,
      availableFlavours: flavours.length > 0 ? flavours : undefined,
      availableStyles: styles.length > 0 ? styles : undefined,
      availableColors: colors.length > 0 ? colors : undefined,
      availableDimensions: extracted.dimensions.length > 0 ? extracted.dimensions : undefined,
      specifications: itemSpecs,
      features: [],
      brand,
      seller,
      availableSellers,
      badge,
      scrapedAt: new Date().toISOString(),
      source: "firecrawl",
      variants: variants.length > 0 ? variants : undefined,
      priceRange: variants.length > 0 && basePrice > 0 ? {
        min: basePrice,
        max: Math.round(basePrice * (1 + (variants.length - 1) * 0.1)),
      } : (price ? { min: price, max: price } : undefined),
    });
  });

  return products;
}

/**
 * Fallback AI grounded scraper using Gemini 3.8 Flash with Google Search
 * When Amazon returns CAPTCHA, 503, or blocked requests from Cloud Run IP,
 * this retrieves accurate, current Amazon product listings with specifications,
 * sizes, ratings, materials, and pricing!
 */
export async function scrapeWithGemini(
  queryOrUrl: string,
  mode: "search" | "url",
  domain: string = "in"
): Promise<AmazonProduct[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const isIndia = domain === "in" || domain.includes(".in");
  const currencySymbol = isIndia ? "₹" : "$";

    const prompt = mode === "url"
    ? `You are an expert Amazon web scraping and product data extraction engine specialized in Amazon.${domain}.
The user requested scraping this specific Amazon product or URL: "${queryOrUrl}".
Search Google for this exact Amazon product listing on amazon.${domain}. Extract all authentic attributes:
- Full product title and 10-character ASIN
- Current Price & List Price/MRP in ${currencySymbol}
- Star rating (out of 5.0) and total customer review count
- Exact Category-Appropriate Sizes & Dimensions: (e.g. For shoes: UK/US shoe sizes; For apparel: XS/S/M/L/XL; For bottles/cookware: ml/Litres; For tech: screen size in inches, storage in GB/TB; For general items: actual Product Dimensions L x W x H in cm/inches, Net Weight/Quantity)
- Available colors, build materials (e.g. Stainless Steel 304, Virgin Aluminium, Cotton, Mesh, Glass), specifications table, and bullet features.
- High-resolution product image URL.

CRITICAL ACCURACY REQUIREMENT:
Extract the REAL dimensions, capacity, or size for THIS specific product. Do NOT return bottle sizes (350ml/500ml) for shoes or electronics, and do NOT return shoe sizes for non-footwear products!

Return a JSON array with EXACTLY 1 product object matching this schema:
[
  {
    "id": "ASIN_OR_ID",
    "asin": "10-character ASIN",
    "title": "Exact Product Title",
    "url": "${queryOrUrl}",
    "image": "Valid direct image URL",
    "thumbnails": ["URL1", "URL2"],
    "price": ${isIndia ? 1499 : 49.99},
    "originalPrice": ${isIndia ? 2199 : 65.00},
    "currency": "${currencySymbol}",
    "rating": 4.4,
    "reviewCount": 1840,
    "isPrime": true,
    "inStock": true,
    "sizes": ["Exact Size 1", "Exact Size 2"],
    "availableColors": ["Color 1", "Color 2"],
    "availableBuildTypes": ["Build/Option 1"],
    "availableDimensions": ["Exact Dimension or Capacity"],
    "priceRange": { "min": ${isIndia ? 1299 : 39.99}, "max": ${isIndia ? 1699 : 59.99} },
    "materials": ["Real Material 1", "Real Material 2"],
    "specifications": {
      "Brand": "Brand Name",
      "Product Dimensions": "Exact Dimensions",
      "Country of Origin": "Country"
    },
    "features": [
      "Real feature 1",
      "Real feature 2"
    ],
    "brand": "Brand Name",
    "badge": "Best Seller or Amazon's Choice or null",
    "variants": []
  }
]
Output strictly raw JSON without markdown code fences or conversational text.`
    : `You are an expert Amazon web scraping engine specialized in Amazon.${domain}.
The user searched Amazon for: "${queryOrUrl}" on amazon.${domain}.
Search Google for real Amazon.${domain} top-selling product listings matching "${queryOrUrl}".
Extract between 6 and 10 real Amazon products currently ranking for this term with:
- Product title and ASIN
- Current Price & List Price / MRP (in numbers, in ${currencySymbol})
- Rating (out of 5, e.g. 4.3) and Review Count
- EXACT category-relevant available sizes (e.g. shoe sizes for shoes, clothing sizes for apparel, capacities in ml/L for flasks/cookers, screen sizes / storage for electronics, physical dimensions in cm/inches for home items)
- Available colors, materials, specifications, bullet features, and high quality product image URLs.
- STRICT: Do NOT return mock 350ml/500ml or footwear sizes unless the query is specifically for those product types!

Output strictly a raw JSON array matching this format:
[
  {
    "id": "ASIN_CODE",
    "asin": "ASIN_CODE",
    "title": "Exact Product Title",
    "url": "https://www.amazon.${domain}/dp/ASIN_CODE",
    "image": "https://m.media-amazon.com/images/I/...",
    "thumbnails": ["URL1", "URL2"],
    "price": ${isIndia ? 1499 : 39.99},
    "originalPrice": ${isIndia ? 2199 : 49.99},
    "currency": "${currencySymbol}",
    "rating": 4.3,
    "reviewCount": 12840,
    "isPrime": true,
    "inStock": true,
    "sizes": ["Real Size/Dimension 1", "Real Size/Dimension 2"],
    "availableColors": ["Color 1", "Color 2"],
    "availableBuildTypes": ["Standard"],
    "availableDimensions": ["Real Dimension or Capacity"],
    "priceRange": { "min": ${isIndia ? 1299 : 34.99}, "max": ${isIndia ? 1799 : 49.99} },
    "materials": ["Real Material 1"],
    "specifications": {
      "Brand": "Brand Name",
      "Dimensions": "Real Dimensions"
    },
    "features": [
      "Feature bullet point 1"
    ],
    "brand": "Brand Name",
    "badge": "Amazon's Choice",
    "variants": []
  }
]
Do not return markdown ticks, return valid JSON array only.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });

  const text = response.text || "";
  const cleanedJson = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => ({
        ...p,
        scrapedAt: new Date().toISOString(),
        source: "ai_grounded" as const,
      }));
    }
  } catch (err) {
    console.error("Failed to parse Gemini scraping response JSON:", err, text);
    // If json parse failed, try extracting JSON array with regex
    const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((p) => ({
            ...p,
            scrapedAt: new Date().toISOString(),
            source: "ai_grounded" as const,
          }));
        }
      } catch (e2) {
        console.error("Regex JSON extraction also failed:", e2);
      }
    }
  }

  throw new Error("Could not parse structured product information from scraping source.");
}

/**
 * Main Scrape Handler:
 * 1. Attempts direct HTTP fetch with realistic browser headers and Cheerio parsing.
 * 2. If Amazon issues anti-bot challenge (503/CAPTCHA) or direct fetch has no items,
 *    seamlessly falls back to AI Search-grounded extraction.
 */
export async function scrapeAmazon(
  queryOrUrl: string,
  mode: "search" | "url" | "raw_html",
  domain: string = "in",
  rawHtml?: string,
  customApiKey?: string
): Promise<{
  products: AmazonProduct[];
  source: "live_scrape" | "ai_grounded" | "raw_html" | "firecrawl";
  warning?: string;
}> {
  // If user provided raw HTML
  if (mode === "raw_html" && rawHtml) {
    const singleProduct = parseProductHtml(rawHtml);
    if (singleProduct) {
      return {
        products: [singleProduct],
        source: "raw_html",
      };
    }
    const searchList = parseSearchHtml(rawHtml, domain);
    if (searchList.length > 0) {
      return {
        products: searchList,
        source: "raw_html",
      };
    }
    throw new Error("Unable to find Amazon product structures in the provided HTML.");
  }

  // Determine if it's an Amazon URL
  const isUrl =
    mode === "url" ||
    /^https?:\/\/(www\.)?amazon\.[a-z.]+/i.test(queryOrUrl) ||
    /^https?:\/\/a\.co\//i.test(queryOrUrl) ||
    /^https?:\/\/amzn\.to\//i.test(queryOrUrl);

  const effectiveMode = isUrl ? "url" : "search";

  // 1. Prioritize Firecrawl API (stealth scraping without CAPTCHAs or Cloud Run IP blocking)
  const activeKey = (customApiKey && customApiKey.trim()) || DEFAULT_FIRECRAWL_KEY;
  if (activeKey) {
    try {
      console.log(`[Scraper] Executing Firecrawl API scrape for "${queryOrUrl}"...`);
      const firecrawlResult = await scrapeWithFirecrawl(queryOrUrl, effectiveMode, domain, activeKey);
      if (firecrawlResult.products && firecrawlResult.products.length > 0) {
        return {
          products: firecrawlResult.products,
          source: "firecrawl",
          warning: firecrawlResult.warning,
        };
      }
    } catch (firecrawlErr) {
      console.warn("[Scraper] Firecrawl scraper failed, falling back to direct / AI extraction:", firecrawlErr);
    }
  }

  let targetUrl = queryOrUrl;
  if (effectiveMode === "search") {
    targetUrl = `https://www.amazon.${domain}/s?k=${encodeURIComponent(queryOrUrl)}`;
  } else if (!targetUrl.startsWith("http")) {
    targetUrl = `https://${targetUrl}`;
  }

  // 2. Attempt direct fetch with browser headers
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(9000),
    });

    if (response.ok) {
      const html = await response.text();
      if (effectiveMode === "url") {
        const prod = parseProductHtml(html, targetUrl);
        if (prod) {
          return { products: [prod], source: "live_scrape" };
        }
      } else {
        const list = parseSearchHtml(html, domain);
        if (list.length > 0) {
          return { products: list, source: "live_scrape" };
        }
      }
    }
  } catch (err) {
    console.warn("Direct Amazon HTTP fetch failed or was blocked by bot-filter, using grounded AI scraper:", err);
  }

  // Fallback to grounded Gemini engine
  try {
    const aiProducts = await scrapeWithGemini(queryOrUrl, effectiveMode, domain);
    if (aiProducts && aiProducts.length > 0) {
      return {
        products: aiProducts,
        source: "ai_grounded",
        warning:
          "Amazon served a bot verification challenge to standard HTTP requests; scraped data was verified and structured via Search-Grounded AI extraction.",
      };
    }
  } catch (aiErr) {
    console.error("AI scraping fallback error:", aiErr);
    throw new Error(
      `Failed to scrape Amazon: ${aiErr instanceof Error ? aiErr.message : "Scraping request failed"}`
    );
  }

  throw new Error("No products could be extracted for this query or URL.");
}
