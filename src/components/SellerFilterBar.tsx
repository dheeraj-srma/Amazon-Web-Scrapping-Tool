import React, { useState } from "react";
import { Store, CheckSquare, Square, Filter, ChevronDown, ChevronUp, X, Check } from "lucide-react";

interface SellerFilterBarProps {
  availableSellers: string[];
  selectedSellers: string[];
  onToggleSeller: (seller: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  sellerCounts?: Record<string, number>;
  compact?: boolean;
}

export const SellerFilterBar: React.FC<SellerFilterBarProps> = ({
  availableSellers,
  selectedSellers,
  onToggleSeller,
  onSelectAll,
  onDeselectAll,
  sellerCounts = {},
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(!compact);

  if (!availableSellers || availableSellers.length === 0) {
    return null;
  }

  const allSelected = selectedSellers.length === availableSellers.length;
  const noneSelected = selectedSellers.length === 0;
  const isFiltered = selectedSellers.length < availableSellers.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Sellers in Report
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {selectedSellers.length} / {availableSellers.length} included
              </span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Filtered ({availableSellers.length - selectedSellers.length} excluded)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Check or uncheck sellers to include or exclude their products and prices in this report
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40 hover:underline cursor-pointer flex items-center gap-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-40 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Square className="w-3.5 h-3.5" />
            Deselect All
          </button>
          {compact && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded ml-1"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Checkbox Pills */}
      {isOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          {availableSellers.map((seller) => {
            const isChecked = selectedSellers.includes(seller);
            const count = sellerCounts[seller];

            return (
              <label
                key={seller}
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none ${
                  isChecked
                    ? "bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs font-semibold"
                    : "bg-slate-50/60 border-slate-200 text-slate-400 line-through opacity-70 hover:opacity-90"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleSeller(seller)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                />
                <span className="truncate max-w-[180px]" title={seller}>
                  {seller}
                </span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isChecked ? "bg-blue-200/60 text-blue-900" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
