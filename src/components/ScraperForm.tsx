import React, { useState } from "react";
import { Search, Link2, ArrowRight, Loader2, Globe, X, Key, ShieldCheck } from "lucide-react";

interface ScraperFormProps {
  onScrape: (mode: "search" | "url", input: string, domain: string) => void;
  isLoading: boolean;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
}

const DOMAINS = [
  { value: "in", label: "Amazon.in (India) - ₹ INR" },
  { value: "com", label: "Amazon.com (US) - $ USD" },
  { value: "co.uk", label: "Amazon.co.uk (UK) - £ GBP" },
  { value: "de", label: "Amazon.de (Germany) - € EUR" },
  { value: "ca", label: "Amazon.ca (Canada)" },
  { value: "co.jp", label: "Amazon.co.jp (Japan)" },
];

export const ScraperForm: React.FC<ScraperFormProps> = ({
  onScrape,
  isLoading,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const [mode, setMode] = useState<"search" | "url">("search");
  const [input, setInput] = useState("");
  const [domain, setDomain] = useState("in");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check if input looks like URL while in search mode
    if (mode === "search" && /^https?:\/\/(www\.)?amazon\./i.test(input.trim())) {
      onScrape("url", input.trim(), domain);
    } else {
      onScrape(mode, input.trim(), domain);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 relative overflow-hidden">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            type="button"
            id="tab-search"
            onClick={() => setMode("search")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
              mode === "search"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Keywords</span>
          </button>
          <button
            type="button"
            id="tab-url"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
              mode === "url"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Specific Amazon URL</span>
          </button>
        </div>

        {/* Region & API Key controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                apiKey
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              }`}
              title="Click to enter or change Firecrawl API Key"
            >
              <Key className={`w-3.5 h-3.5 ${apiKey ? "text-emerald-600" : "text-amber-600"}`} />
              <span>{apiKey ? "API Key Configured" : "Enter API Key"}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <label htmlFor="domain-select" className="text-slate-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Region:</span>
            </label>
            <select
              id="domain-select"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            {mode === "search" ? (
              <Search className="w-5 h-5 text-blue-600" />
            ) : (
              <Link2 className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <input
            id="scraper-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "search"
                ? 'Enter search terms (e.g., "Running Shoes", "Wireless Headphones")...'
                : "Paste Amazon product URL (e.g., https://www.amazon.com/dp/B08N5WRWNW)..."
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-36 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            disabled={isLoading}
          />

          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="absolute right-28 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="scrape-submit-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Extracting...</span>
              </>
            ) : (
              <>
                <span>Extract Data</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Feature Indicators from Design */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Rupee (₹) Pricing
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Size, Color & Build Matrix
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Option Price Comparison
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Brand & Review Intelligence
        </span>
      </div>
    </div>
  );
};
