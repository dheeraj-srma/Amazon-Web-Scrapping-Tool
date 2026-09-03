import React, { useEffect } from "react";
import { X, Star, Trash2, CheckCircle2, Sliders, ExternalLink, Store } from "lucide-react";
import { AmazonProduct } from "../types";
import { formatPrice, formatPriceDisplay } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface CompareModalProps {
  isOpen: boolean;
  products: AmazonProduct[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  products,
  onClose,
  onRemove,
  onClear,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // If not open, DO NOT render anything
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Product Comparison Matrix</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  {products.length} Items Selected
                </span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                INR (₹)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side comparison of prices, volume options, sizes, materials, and seller market quotes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear All */}
            {products.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                title="Clear comparison list"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="close-compare-modal-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Close matrix (Esc)"
              aria-label="Close comparison matrix"
            >
              <X className="w-4 h-4 text-slate-500 hover:text-rose-600" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto bg-slate-50/50 flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Sliders className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">No products selected for comparison</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Toggle the compare checkbox on product cards in the grid or table to compare specifications and prices side-by-side.
              </p>
            </div>
          ) : (
            /* Side-by-side cards view */
            <div className="grid grid-flow-col auto-cols-[280px] sm:auto-cols-[320px] gap-4 min-w-full">
              {products.map((p) => {
                const priceInfo = formatPriceDisplay(p);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4 relative group shadow-xs"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors z-10 border border-slate-200 cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Product Image & Title */}
                    <div>
                      <div className="aspect-square w-full rounded-lg bg-slate-50 p-2 border border-slate-100 mb-3 flex items-center justify-center overflow-hidden shadow-2xs">
                        <ProductImage
                          src={p.image}
                          alt={p.title}
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                          iconSize="md"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1.5 leading-snug">
                        {p.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>
                          Brand: <strong className="text-slate-700">{p.brand || "Brand"}</strong>
                        </span>
                        {p.asin && <span className="font-mono text-[10px] text-slate-400">{p.asin}</span>}
                      </div>
                      {p.seller && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-700 font-medium bg-blue-50/70 px-1.5 py-0.5 rounded border border-blue-100 truncate mb-1">
                          <Store className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Sold by: {p.seller}</span>
                        </div>
                      )}
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      {/* Price Range & Base Price */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">
                          Price Display (INR)
                        </span>
                        <span className="text-base font-bold text-slate-900 block">
                          {priceInfo.display}
                        </span>
                        {priceInfo.range && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Range: {formatPrice(priceInfo.range.min, p.currency)} –{" "}
                            {formatPrice(priceInfo.range.max, p.currency)}
                          </span>
                        )}
                      </div>

                      {/* Option Variety Breakdown */}
                      {p.variants && p.variants.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                            <span className="flex items-center gap-1">
                              <Sliders className="w-3 h-3 text-blue-600" />
                              Option Variations ({p.variants.length})
                            </span>
                          </div>
                          <div className="space-y-1 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-100">
                            {p.variants.slice(0, 5).map((v) => (
                              <div
                                key={v.id}
                                className="flex items-center justify-between text-[10px] text-slate-700"
                              >
                                <span className="truncate pr-1">
                                  {[v.size, v.buildType || v.color].filter(Boolean).join(" · ")}
                                </span>
                                <span className="font-semibold text-emerald-700 shrink-0">
                                  {formatPrice(v.price, p.currency)}
                                </span>
                              </div>
                            ))}
                            {p.variants.length > 5 && (
                              <span className="text-[9px] text-slate-400 block text-center pt-0.5">
                                +{p.variants.length - 5} more options
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rating */}
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                          Rating & Reviews
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{p.rating ? `${p.rating.toFixed(1)} / 5` : "N/A"}</span>
                          <span className="text-slate-400 font-normal text-[11px]">
                            ({p.reviewCount?.toLocaleString() || 0})
                          </span>
                        </div>
                      </div>

                      {/* Prime & Stock */}
                      <div className="flex items-center justify-between">
                        {p.isPrime ? (
                          <span className="inline-flex items-center gap-1 text-sky-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Prime Delivery
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Standard Shipping</span>
                        )}
                        <span
                          className={`text-[11px] font-medium ${
                            p.inStock ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      {/* Available Sizes */}
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                          Sizes / Options ({p.sizes?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {p.sizes && p.sizes.length > 0 ? (
                            p.sizes.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">One size / Standard</span>
                          )}
                        </div>
                      </div>

                      {/* Materials */}
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                          Materials & Build
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.materials && p.materials.length > 0 ? (
                            p.materials.map((m, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                              >
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard specs</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Link */}
                    <div className="pt-2">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <span>View on Amazon.in</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono shadow-2xs">Esc</kbd> or click outside to dismiss</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <X className="w-4 h-4 text-slate-300" />
            <span>Close Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
