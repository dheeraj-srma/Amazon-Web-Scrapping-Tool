import React, { useState } from "react";
import {
  Star,
  ExternalLink,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Sliders,
  Store,
} from "lucide-react";
import { AmazonProduct } from "../types";
import { formatPrice, formatPriceDisplay } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface ProductTableViewProps {
  products: AmazonProduct[];
  onSelect: (product: AmazonProduct) => void;
  comparedIds: string[];
  onToggleCompare: (product: AmazonProduct) => void;
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  products,
  onSelect,
  comparedIds,
  onToggleCompare,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (p: AmazonProduct) => {
    navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">Compare</th>
              <th className="py-3.5 px-4 w-16">Image</th>
              <th className="py-3.5 px-4 min-w-[220px]">Product Details</th>
              <th className="py-3.5 px-4 min-w-[140px]">Price & Range (INR ₹)</th>
              <th className="py-3.5 px-4 min-w-[120px]">Option Variety</th>
              <th className="py-3.5 px-4 min-w-[110px]">Rating</th>
              <th className="py-3.5 px-4 min-w-[130px]">Sizes Available</th>
              <th className="py-3.5 px-4 min-w-[130px]">Materials & Build</th>
              <th className="py-3.5 px-4 min-w-[90px]">ASIN</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const isCompared = comparedIds.includes(p.id);
              const priceInfo = formatPriceDisplay(p);

              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  {/* Compare Checkbox */}
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(p);
                    }}
                  >
                    <button
                      type="button"
                      className={`p-1 rounded-md border transition-colors shadow-2xs ${
                        isCompared
                          ? "bg-blue-600 text-white border-blue-600 font-bold"
                          : "bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700"
                      }`}
                      title={isCompared ? "Remove from comparison" : "Add to comparison"}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Thumbnail Image */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 p-1 border border-slate-100 flex items-center justify-center overflow-hidden shadow-2xs">
                      <ProductImage
                        src={p.image}
                        alt={p.title}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                        iconSize="sm"
                      />
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {p.brand || "Brand"}
                        </span>
                        {p.isPrime && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" />
                            Prime
                          </span>
                        )}
                        {p.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {p.badge}
                          </span>
                        )}
                        {p.seller && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100">
                            <Store className="w-2.5 h-2.5" />
                            {p.seller}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </span>
                    </div>
                  </td>

                  {/* Price & Range */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">
                        {priceInfo.display}
                      </span>
                      {priceInfo.range && (
                        <span className="text-[10px] text-slate-500">
                          Span: {formatPrice(priceInfo.range.min, p.currency)}–{formatPrice(priceInfo.range.max, p.currency)}
                        </span>
                      )}
                      {p.originalPrice && p.price && p.originalPrice > p.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          MRP: {formatPrice(p.originalPrice, p.currency)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Option Variety */}
                  <td className="py-3 px-4">
                    {p.variants && p.variants.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Sliders className="w-3 h-3 text-emerald-600" />
                        {p.variants.length} Options (Varied)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Single SKU</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    {p.rating !== null ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {p.reviewCount ? `${p.reviewCount.toLocaleString()} reviews` : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">No ratings</span>
                    )}
                  </td>

                  {/* Sizes */}
                  <td className="py-3 px-4">
                    {p.sizes && p.sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {p.sizes.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                        {p.sizes.length > 3 && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-400">
                            +{p.sizes.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Standard</span>
                    )}
                  </td>

                  {/* Materials */}
                  <td className="py-3 px-4">
                    {p.materials && p.materials.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {p.materials.slice(0, 2).map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>

                  {/* ASIN */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {p.asin || "-"}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(p);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors"
                        title="View Full Specs & Options"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(p);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                        title="Copy JSON"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors"
                        title="Open on Amazon.in"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
