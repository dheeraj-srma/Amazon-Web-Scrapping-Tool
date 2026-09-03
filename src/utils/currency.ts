import { AmazonProduct, ProductVariant } from "../types";

/**
 * Formats monetary amounts specifically tailored for Indian Rupee (INR / ₹)
 * and international currencies.
 */
export function formatPrice(amount: number | null | undefined, currency = "₹"): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "N/A";
  }

  const cleanCurrency = currency || "₹";

  if (cleanCurrency === "₹" || cleanCurrency.toUpperCase() === "INR") {
    // Format according to Indian numbering system (e.g. ₹1,499 or ₹1,25,000)
    const formatted = Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    });
    return `₹${formatted}`;
  }

  // Non-INR standard formatting
  const formatted = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${cleanCurrency}${formatted}`;
}

export interface FormattedPriceResult {
  display: string;
  displayPrice: string;
  originalPrice?: string;
  hasRange: boolean;
  minPrice: number;
  maxPrice: number;
  range: { min: number; max: number } | null;
  discountPercent?: number;
}

/**
 * Returns formatted price range if product has variants with varying prices,
 * or standard formatted price.
 */
export function formatPriceDisplay(
  product: AmazonProduct,
  selectedVariant?: ProductVariant | null
): FormattedPriceResult {
  const currency = product.currency || "₹";

  // If a specific variant is selected, use that variant's pricing
  if (selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null) {
    const orig = selectedVariant.originalPrice || product.originalPrice;
    const discount =
      orig && orig > selectedVariant.price
        ? Math.round(((orig - selectedVariant.price) / orig) * 100)
        : undefined;

    const formatted = formatPrice(selectedVariant.price, currency);

    return {
      display: formatted,
      displayPrice: formatted,
      originalPrice: orig && orig > selectedVariant.price ? formatPrice(orig, currency) : undefined,
      hasRange: false,
      minPrice: selectedVariant.price,
      maxPrice: selectedVariant.price,
      range: null,
      discountPercent: discount,
    };
  }

  // Check variants for price spread
  const variantPrices = product.variants
    ? product.variants
        .map((v) => v.price)
        .filter((p): p is number => typeof p === "number" && p > 0)
    : [];

  if (variantPrices.length > 1) {
    const min = Math.min(...variantPrices);
    const max = Math.max(...variantPrices);

    if (min !== max) {
      const orig = product.originalPrice;
      const discount =
        orig && orig > min ? Math.round(((orig - min) / orig) * 100) : undefined;
      const formattedRange = `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;

      return {
        display: formattedRange,
        displayPrice: formattedRange,
        originalPrice: orig && orig > max ? formatPrice(orig, currency) : undefined,
        hasRange: true,
        minPrice: min,
        maxPrice: max,
        range: { min, max },
        discountPercent: discount,
      };
    }
  }

  // Standard product price
  const price = product.price ?? 0;
  const orig = product.originalPrice;
  const discount =
    orig && price && orig > price ? Math.round(((orig - price) / orig) * 100) : undefined;
  const formattedStandard = formatPrice(product.price, currency);

  return {
    display: formattedStandard,
    displayPrice: formattedStandard,
    originalPrice: orig && price && orig > price ? formatPrice(orig, currency) : undefined,
    hasRange: false,
    minPrice: price,
    maxPrice: price,
    range: null,
    discountPercent: discount,
  };
}
