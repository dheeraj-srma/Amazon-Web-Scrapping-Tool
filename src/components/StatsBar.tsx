import React, { useState } from "react";
import {
  LayoutGrid,
  Table as TableIcon,
  Download,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  Flame,
} from "lucide-react";
import { AmazonProduct } from "../types";
import { formatPrice } from "../utils/currency";

interface StatsBarProps {
  products: AmazonProduct[];
  source?: string;
  durationMs?: number;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  filterText: string;
  onFilterTextChange: (text: string) => void;
  primeOnly: boolean;
  onPrimeOnlyChange: (val: boolean) => void;
  minRating: number;
  onMinRatingChange: (val: number) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  products,
  source,
  durationMs,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  filterText,
  onFilterTextChange,
  primeOnly,
  onPrimeOnlyChange,
  minRating,
  onMinRatingChange,
  onExportCsv,
  onExportJson,
  onExportMarkdown,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Compute stats including variant pricing and currency
  const currency = products[0]?.currency || "₹";
  const allPrices: number[] = [];
  products.forEach((p) => {
    if (p.price && p.price > 0) allPrices.push(p.price);
    if (p.variants) {
      p.variants.forEach((v) => {
        if (v.price && v.price > 0) allPrices.push(v.price);
      });
    }
  });

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  const validRatings = products.map((p) => p.rating).filter((r): r is number => r !== null && r > 0);
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
    : "N/A";

  const primeCount = products.filter((p) => p.isPrime).length;
  const totalOptions = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Top row: summary metrics + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Metric pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
            <span className="text-slate-500">Products: </span>
            <span className="font-semibold text-slate-900">{products.length}</span>
          </div>

          {totalOptions > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="text-emerald-600">Option Variations: </span>
              <span className="font-bold">{totalOptions} variants</span>
            </div>
          )}

          {allPrices.length > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              <span className="text-slate-500">Price Span: </span>
              <span className="font-semibold text-blue-600">
                {formatPrice(minPrice, currency)} – {formatPrice(maxPrice, currency)}
              </span>
            </div>
          )}

          {avgRating !== "N/A" && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1">
              <span className="text-slate-500">Avg Rating: </span>
              <span className="font-semibold text-amber-500">★ {avgRating}</span>
            </div>
          )}

          {primeCount > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-sky-600" />
              <span className="font-medium">{primeCount} Prime</span>
            </div>
          )}

          {durationMs !== undefined && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{(durationMs / 1000).toFixed(2)}s</span>
            </div>
          )}

          {source && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                source === "firecrawl"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : source === "ai_grounded"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {source === "firecrawl" ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Firecrawl API</span>
                </>
              ) : source === "ai_grounded" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Search-Grounded</span>
                </>
              ) : (
                <span>Direct Amazon HTML</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons: Filter, Sort, View, Export */}
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs ${
              showFilters || filterText || primeOnly || minRating > 0
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Filter results"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rating</option>
              <option value="reviews_desc">Most Reviewed</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={onExportCsv}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download CSV (.csv)</span>
                </button>
                <button
                  onClick={onExportJson}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span>Download JSON (.json)</span>
                </button>
                <button
                  onClick={onExportMarkdown}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Copy Markdown Table</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 font-medium mb-1">
              Search inside results:
            </label>
            <input
              type="text"
              value={filterText}
              onChange={(e) => onFilterTextChange(e.target.value)}
              placeholder="Filter by title, brand, material..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-medium mb-1">
              Minimum Rating:
            </label>
            <select
              value={minRating}
              onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & up</option>
              <option value="4.0">★ 4.0 & up</option>
              <option value="3.5">★ 3.5 & up</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(e) => onPrimeOnlyChange(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Prime Eligible Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
