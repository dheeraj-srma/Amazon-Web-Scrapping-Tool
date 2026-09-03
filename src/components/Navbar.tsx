import React from "react";
import { ShoppingBag, Sparkles, FileCode2, History, Layers, Key } from "lucide-react";

interface NavbarProps {
  onOpenHtmlModal: () => void;
  onOpenHistoryModal: () => void;
  historyCount: number;
  compareCount: number;
  onOpenCompareModal: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHtmlModal,
  onOpenHistoryModal,
  historyCount,
  compareCount,
  onOpenCompareModal,
  onOpenApiKeyModal,
  hasCustomKey,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-800 tracking-tight">
                AmzScraper<span className="text-blue-600 font-semibold">Pro</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>System Ready</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Intelligent Amazon catalog, variant & seller extraction
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* API Key Modal Button */}
          <button
            id="open-api-key-btn"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-xs ${
              hasCustomKey
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
            }`}
            title="Configure Firecrawl or Custom Scraper API Key"
          >
            <Key className={`w-3.5 h-3.5 ${hasCustomKey ? "text-emerald-600" : "text-amber-600"}`} />
            <span className="hidden sm:inline">
              {hasCustomKey ? "API Key (Active)" : "Enter API Key"}
            </span>
            <span className="sm:hidden">Key</span>
          </button>

          {compareCount > 0 && (
            <button
              id="compare-btn"
              onClick={onOpenCompareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100/70 transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare ({compareCount})</span>
            </button>
          )}

          <button
            id="open-html-modal-btn"
            onClick={onOpenHtmlModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
            title="Parse raw Amazon HTML directly"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Paste HTML</span>
          </button>

          <button
            id="open-history-btn"
            onClick={onOpenHistoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
            title="View scraping history"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 text-[10px] flex items-center justify-center font-semibold text-slate-700">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
