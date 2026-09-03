import React, { useState } from "react";
import {
  Star,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  CheckCircle2,
  Tag,
  Sliders,
  Store,
} from "lucide-react";
import { AmazonProduct, ProductVariant } from "../types";
import { formatPrice, formatPriceDisplay } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: AmazonProduct;
  onSelect: (product: AmazonProduct) => void;
  isCompared: boolean;
  onToggleCompare: (product: AmazonProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isCompared,
  onToggleCompare,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const priceInfo = formatPriceDisplay(product, selectedVariant);

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveOriginal = selectedVariant?.originalPrice ?? product.originalPrice;

  const discountPercent =
    effectiveOriginal && effectivePrice && effectiveOriginal > effectivePrice
      ? Math.round(((effectiveOriginal - effectivePrice) / effectiveOriginal) * 100)
      : null;

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(product, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer relative"
    >
      {/* Top Media & Badges */}
      <div>
        <div className="relative aspect-square w-full rounded-lg bg-slate-50 p-4 mb-3 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-slate-200 transition-colors">
          <ProductImage
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-300"
            iconSize="lg"
          />

          {/* Badges on top left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {product.badge}
              </span>
            )}
            {product.isPrime && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" />
                Prime
              </span>
            )}
            {product.variants && product.variants.length > 1 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <Sliders className="w-2.5 h-2.5 text-emerald-600" />
                {product.variants.length} Options
              </span>
            )}
          </div>

          {/* Compare toggle on top right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border text-xs transition-colors z-10 shadow-xs ${
              isCompared
                ? "bg-blue-600 text-white border-blue-600 font-semibold"
                : "bg-white/95 text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-white"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brand & ASIN */}
        <div className="flex items-center justify-between gap-2 mb-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 truncate">
            {product.brand || "Amazon Catalog"}
          </span>
          {product.asin && (
            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {product.asin}
            </span>
          )}
        </div>

        {/* Seller Info if available */}
        {product.seller && (
          <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium mb-1.5 truncate">
            <Store className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="truncate">Sold by: {product.seller}</span>
          </div>
        )}

        {/* Title */}
        <h3
          className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 transition-colors"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-2.5 text-xs">
          {product.rating !== null ? (
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-slate-400">No ratings</span>
          )}
          {product.reviewCount !== null && (
            <span className="text-slate-500">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
          )}
        </div>

        {/* Price Card & Range */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {priceInfo.display}
              </span>
              {effectiveOriginal && effectivePrice && effectiveOriginal > effectivePrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(effectiveOriginal, product.currency)}
                </span>
              )}
            </div>

            {discountPercent && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Active variant label */}
          {selectedVariant && (
            <div className="mt-1 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="truncate font-medium text-blue-700">
                Selected: {[selectedVariant.size, selectedVariant.buildType || selectedVariant.dimensions].filter(Boolean).join(" · ")}
              </span>
              {priceInfo.range && (
                <span className="text-[10px] text-slate-400 ml-1">
                  Range: {formatPrice(priceInfo.range.min, product.currency)}–{formatPrice(priceInfo.range.max, product.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Interactive Option Chips (Size / Option with individual prices) */}
        {product.variants && product.variants.length > 0 ? (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-600" /> Options & Prices ({product.variants.length}):
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Click to select</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {product.variants.slice(0, 8).map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const label = [v.size, v.buildType || v.dimensions].filter(Boolean).join(" · ");
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`text-[10px] px-2 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>{label || v.color || "Option"}</span>
                    <span className={isSelected ? "text-blue-100 font-bold" : "text-emerald-700 font-medium"}>
                      {formatPrice(v.price, product.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : product.sizes && product.sizes.length > 0 ? (
          /* Standard Sizes fallback */
          <div className="mb-2.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-blue-600" /> Sizes ({product.sizes.length}):
            </span>
            <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
              {product.sizes.slice(0, 5).map((size, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">
                  +{product.sizes.length - 5} more
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Extracted Materials Tag Group */}
        {product.materials && product.materials.length > 0 && (
          <div className="mb-3">
            <span className="text-[11px] font-medium text-slate-500 mb-1 block">
              Materials:
            </span>
            <div className="flex flex-wrap gap-1">
              {product.materials.slice(0, 2).map((mat, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 border border-slate-200 transition-colors shadow-2xs"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Full Specs & Options</span>
        </button>

        <button
          type="button"
          onClick={handleCopyJson}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
          title="Copy raw JSON"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors"
          title="Open listing on Amazon"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
