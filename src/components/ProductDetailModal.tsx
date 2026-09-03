import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
  Package,
  Code2,
  Sliders,
  ArrowUpDown,
  CheckCheck,
  Store,
} from "lucide-react";
import { AmazonProduct, ProductVariant } from "../types";
import { formatPrice, formatPriceDisplay } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface ProductDetailModalProps {
  product: AmazonProduct | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [variantSort, setVariantSort] = useState<"price-asc" | "price-desc" | "default">("default");

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setActiveImageIndex(0);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (product) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [product, onClose]);

  if (!product) return null;

  const images =
    product.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails
      : [product.image];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(product, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentOriginal = selectedVariant?.originalPrice ?? product.originalPrice;

  const discountPercent =
    currentOriginal && currentPrice && currentOriginal > currentPrice
      ? Math.round(((currentOriginal - currentPrice) / currentOriginal) * 100)
      : null;

  const priceInfo = formatPriceDisplay(product, selectedVariant);

  // Sorted variants
  const sortedVariants = [...(product.variants || [])].sort((a, b) => {
    if (variantSort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
    if (variantSort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
    return 0;
  });

  const baselinePrice = product.price ?? (sortedVariants[0]?.price || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> Scraped Product Intel
            </span>
            {product.asin && (
              <span className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                ASIN: {product.asin}
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              India (INR ₹)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors font-medium"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{showRawJson ? "View Specs" : "View JSON"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {showRawJson ? (
            <div className="relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-mono text-slate-500">Structured Extracted JSON Data</span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied!" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[60vh] leading-relaxed shadow-inner">
                {JSON.stringify(product, null, 2)}
              </pre>
            </div>
          ) : (
            <>
              {/* Product Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Gallery */}
                <div className="space-y-3">
                  <div className="aspect-square w-full rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <ProductImage
                      src={images[activeImageIndex] || product.image}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                      iconSize="xl"
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {images.map((thumb, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded-lg bg-slate-50 p-1 border transition-all flex-shrink-0 flex items-center justify-center overflow-hidden ${
                            activeImageIndex === idx
                              ? "border-blue-600 ring-2 ring-blue-500/30"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <ProductImage
                            src={thumb}
                            alt=""
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                            iconSize="sm"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {product.brand && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block">
                          {product.brand}
                        </span>
                      )}
                      {product.seller && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Store className="w-3 h-3 text-emerald-600" />
                          Sold by: {product.seller}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      {product.title}
                    </h2>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 text-sm">
                    {product.rating !== null && (
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{product.rating.toFixed(1)} / 5.0</span>
                      </div>
                    )}
                    {product.reviewCount !== null && (
                      <span className="text-slate-500 text-xs sm:text-sm">
                        ({product.reviewCount.toLocaleString()} customer ratings)
                      </span>
                    )}
                  </div>

                  {/* Price & Prime with selected variant */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">
                        {selectedVariant
                          ? `Selected Option: ${[selectedVariant.size, selectedVariant.buildType || selectedVariant.color].filter(Boolean).join(" - ")}`
                          : "Price Range & Pricing"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        {currentPrice !== null ? (
                          <>
                            <span className="text-2xl font-black text-slate-900">
                              {formatPrice(currentPrice, product.currency)}
                            </span>
                            {currentOriginal && currentOriginal > currentPrice && (
                              <span className="text-sm text-slate-400 line-through">
                                {formatPrice(currentOriginal, product.currency)}
                              </span>
                            )}
                            {discountPercent && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Save {discountPercent}%
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500 font-medium">Check on Amazon.in</span>
                        )}
                      </div>

                      {priceInfo.range && (
                        <p className="text-xs text-slate-500 mt-1">
                          Complete option pricing span:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatPrice(priceInfo.range.min, product.currency)} – {formatPrice(priceInfo.range.max, product.currency)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {product.isPrime && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Prime Delivery
                        </span>
                      )}
                      <span className={`text-xs font-medium ${product.inStock ? "text-emerald-600" : "text-rose-600"}`}>
                        {product.inStock ? "● In Stock" : "● Out of Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Amazon-style Variant Cards Selector */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1.5 text-sm mb-2.5">
                        <span className="text-slate-700 font-medium">
                          {product.availableFlavours?.length
                            ? "Flavour"
                            : product.sizes?.length
                            ? "Size"
                            : product.availableColors?.length
                            ? "Colour"
                            : "Option"}:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedVariant?.optionLabel ||
                            selectedVariant?.size ||
                            selectedVariant?.flavour ||
                            selectedVariant?.color ||
                            "Select Option"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 max-h-56 overflow-y-auto p-0.5">
                        {product.variants.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const cardTitle =
                            variant.optionLabel ||
                            [
                              variant.flavour,
                              variant.size,
                              variant.color,
                              variant.style,
                            ]
                              .filter(Boolean)
                              .join(" - ") ||
                            variant.skuOrAsin ||
                            "Option";

                          const origPrice =
                            variant.originalPrice ||
                            (variant.price > 0
                              ? Math.round(variant.price * 1.35)
                              : undefined);

                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => setSelectedVariant(variant)}
                              className={`text-left p-3 rounded-lg transition-all cursor-pointer min-w-[125px] max-w-[170px] flex flex-col justify-between border ${
                                isSelected
                                  ? "border-2 border-blue-600 bg-sky-50/40 shadow-xs ring-2 ring-blue-500/20"
                                  : "border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/60"
                              }`}
                            >
                              {variant.image ? (
                                <div className="mb-2 w-full flex flex-col items-center">
                                  <div className="w-full h-16 bg-slate-50 rounded-md overflow-hidden flex items-center justify-center p-1 border border-slate-100 mb-1.5">
                                    <img
                                      src={variant.image}
                                      alt={cardTitle}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-700 line-clamp-1 w-full text-center">
                                    {cardTitle}
                                  </span>
                                </div>
                              ) : (
                                <div className="mb-2">
                                  <span
                                    className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                                    title={cardTitle}
                                  >
                                    {cardTitle}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 tracking-tight">
                                  {formatPrice(variant.price, product.currency)}
                                </span>
                                {origPrice && origPrice > variant.price && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    {formatPrice(origPrice, product.currency)}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Flavours Section (only when no variant swatch cards) */}
                  {(!product.variants || product.variants.length <= 1) && product.availableFlavours && product.availableFlavours.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-purple-600" />
                        <span>Flavours & Scents ({product.availableFlavours.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.availableFlavours.map((fl, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold"
                          >
                            {fl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Sizes / Weights / Dimensions List (only when no variant swatch cards) */}
                  {(!product.variants || product.variants.length <= 1) && ((product.sizes && product.sizes.length > 0) || (product.availableDimensions && product.availableDimensions.length > 0)) && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Size, Weight & Volume</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set([...(product.sizes || []), ...(product.availableDimensions || [])])).map((size, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Colours Section */}
                  {product.availableColors && product.availableColors.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        <span>Available Colours & Shades</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.availableColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials & Item Form Section */}
                  {product.materials && product.materials.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Form & Build Materials</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((mat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Open Amazon.in Link */}
                  <div className="pt-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-colors"
                    >
                      <span>View Live on Amazon.in</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Complete Multi-Variant & Option Pricing Comparison Table */}
              {product.variants && product.variants.length > 1 && (() => {
                const hasFlavours = product.variants.some((v) => !!v.flavour);
                const hasSizes = product.variants.some((v) => !!v.size || !!v.dimensions);
                const hasColors = product.variants.some((v) => !!v.color);
                const hasBuild = product.variants.some((v) => !!v.buildType || !!v.material || !!v.style);

                return (
                  <div className="border-t border-slate-200 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-600" />
                          Complete Option & Variant Pricing Comparison
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Compare how prices differ across flavour variety, size, weight, colour, and form.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort:
                        </span>
                        <select
                          value={variantSort}
                          onChange={(e) => setVariantSort(e.target.value as any)}
                          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="default">Default Order</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Option Variety</th>
                              {hasFlavours && <th className="py-2.5 px-3">Flavour / Scent</th>}
                              {hasSizes && <th className="py-2.5 px-3">Size / Weight</th>}
                              {hasColors && <th className="py-2.5 px-3">Colour / Shade</th>}
                              {hasBuild && <th className="py-2.5 px-3">Form / Material / Style</th>}
                              <th className="py-2.5 px-3">Price (₹ INR)</th>
                              <th className="py-2.5 px-3">Price Diff</th>
                              <th className="py-2.5 px-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sortedVariants.map((variant) => {
                              const isSelected = selectedVariant?.id === variant.id;
                              const diff = (variant.price ?? 0) - baselinePrice;

                              return (
                                <tr
                                  key={variant.id}
                                  onClick={() => setSelectedVariant(variant)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected ? "bg-blue-50/70 font-medium" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1.5">
                                      {isSelected && <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                      <span className="font-semibold text-slate-800">
                                        {variant.optionLabel || variant.skuOrAsin || variant.id}
                                      </span>
                                    </div>
                                  </td>
                                  {hasFlavours && (
                                    <td className="py-2.5 px-3 font-semibold text-purple-700">
                                      {variant.flavour || "-"}
                                    </td>
                                  )}
                                  {hasSizes && (
                                    <td className="py-2.5 px-3 font-medium text-slate-700">
                                      {variant.size || variant.dimensions || "-"}
                                    </td>
                                  )}
                                  {hasColors && (
                                    <td className="py-2.5 px-3 text-slate-600">
                                      {variant.color || "-"}
                                    </td>
                                  )}
                                  {hasBuild && (
                                    <td className="py-2.5 px-3 text-slate-600">
                                      <span>{variant.buildType || variant.material || variant.style || "-"}</span>
                                    </td>
                                  )}
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="font-bold text-slate-900 text-sm">
                                        {formatPrice(variant.price, product.currency)}
                                      </span>
                                      {variant.originalPrice && variant.originalPrice > (variant.price ?? 0) && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          {formatPrice(variant.originalPrice, product.currency)}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {diff === 0 ? (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                        Base
                                      </span>
                                    ) : diff > 0 ? (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                        +{formatPrice(diff, product.currency)}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                                        -{formatPrice(Math.abs(diff), product.currency)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVariant(variant);
                                      }}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                        isSelected
                                          ? "bg-blue-600 text-white shadow-2xs"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {isSelected ? "Selected" : "Select"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Technical Specifications Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Product Specifications & Technical Details
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specifications).map(([key, val], idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50/70 border-r border-slate-100">
                              {key}
                            </td>
                            <td className="py-2.5 px-4 text-slate-800 font-medium">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* About This Item Bullets */}
              {product.features && product.features.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    About This Item
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
