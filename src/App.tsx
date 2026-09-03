import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { AmazonProduct, ScrapeResultResponse } from "./types";
import { INITIAL_INDIAN_MARKET_PRODUCTS } from "./data/sampleProducts";
import { Navbar } from "./components/Navbar";
import { ScraperForm } from "./components/ScraperForm";
import { StatsBar } from "./components/StatsBar";
import { ProductCard } from "./components/ProductCard";
import { ProductTableView } from "./components/ProductTableView";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CompareModal } from "./components/CompareModal";
import { HtmlPasteModal } from "./components/HtmlPasteModal";
import { HistoryModal, HistoryItem } from "./components/HistoryModal";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { exportToCsv, exportToJson, generateMarkdownTable } from "./utils/exportUtils";
import { SOAP_DISPENSER_PRODUCTS } from "./data/soapDispenserComparisonData";
import { FileSpreadsheet } from "lucide-react";

export default function App() {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<"search" | "url" | "raw_html">("search");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [durationMs, setDurationMs] = useState<number | undefined>(undefined);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [comparedProducts, setComparedProducts] = useState<AmazonProduct[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("firecrawl_api_key") || "fc-834bd56f84274573bf6dc5be0adfcd55";
    } catch {
      return "fc-834bd56f84274573bf6dc5be0adfcd55";
    }
  });

  // View & Filters
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filterText, setFilterText] = useState<string>("");
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Local storage history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("amazon_scraper_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quick load PDF Soap Dispenser Range
  const handleLoadPdfSoapDispenserRange = () => {
    setProducts(SOAP_DISPENSER_PRODUCTS);
    setCurrentQuery("Soap Dispenser Range Sample");
    setViewMode("grid");
    showToast("Loaded Soap Dispenser Sample Products!");
  };

  useEffect(() => {
    try {
      localStorage.setItem("amazon_scraper_history", JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Main Scraper API Caller
  const handleScrape = async (
    mode: "search" | "url",
    inputVal: string,
    domain: string
  ) => {
    setIsLoading(true);
    setError(null);
    setWarning(null);
    setCurrentQuery(inputVal);
    setCurrentMode(mode);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          query: mode === "search" ? inputVal : undefined,
          url: mode === "url" ? inputVal : undefined,
          options: { domain },
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data: ScrapeResultResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract product data from Amazon.");
      }

      if (!data.products || data.products.length === 0) {
        throw new Error("No products were found matching the request.");
      }

      setProducts(data.products);
      setSource(data.source);
      setDurationMs(data.durationMs);
      if (data.warning) {
        setWarning(data.warning);
      }

      // Record in history
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        queryOrUrl: inputVal,
        mode,
        count: data.products.length,
        timestamp: new Date().toISOString(),
        products: data.products,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
      showToast(`Scraped ${data.products.length} products successfully!`);
    } catch (err) {
      console.error("Scrape failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // HTML parsing handler
  const handleParseRawHtml = async (html: string) => {
    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch("/api/scrape/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const data: ScrapeResultResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse HTML.");
      }

      setProducts(data.products);
      setSource("raw_html");
      setDurationMs(data.durationMs);
      setIsHtmlModalOpen(false);
      showToast(`Parsed ${data.products.length} products from HTML!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse HTML.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compare toggles
  const handleToggleCompare = (product: AmazonProduct) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        showToast("You can compare up to 4 products at a time.");
        return prev;
      }
      showToast(`Added "${product.title.slice(0, 24)}..." to comparison.`);
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Filter & Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search text filter
        if (filterText.trim()) {
          const q = filterText.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchAsin = p.asin?.toLowerCase().includes(q);
          const matchMaterials = p.materials?.some((m) => m.toLowerCase().includes(q));
          const matchSizes = p.sizes?.some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchBrand && !matchAsin && !matchMaterials && !matchSizes) {
            return false;
          }
        }

        // Prime filter
        if (primeOnly && !p.isPrime) return false;

        // Min rating filter
        if (minRating > 0 && (p.rating === null || p.rating < minRating)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          return (a.price ?? 999999) - (b.price ?? 999999);
        }
        if (sortBy === "price_desc") {
          return (b.price ?? 0) - (a.price ?? 0);
        }
        if (sortBy === "rating_desc") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        }
        if (sortBy === "reviews_desc") {
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        }
        return 0; // featured / default
      });
  }, [products, filterText, primeOnly, minRating, sortBy]);

  // Export handlers
  const handleExportCsv = () => {
    exportToCsv(filteredAndSortedProducts, `amazon-${currentQuery.replace(/[^a-z0-9]/gi, "_")}.csv`);
    showToast("Downloaded CSV file!");
  };

  const handleExportJson = () => {
    exportToJson(filteredAndSortedProducts, `amazon-${currentQuery.replace(/[^a-z0-9]/gi, "_")}.json`);
    showToast("Downloaded JSON file!");
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownTable(filteredAndSortedProducts);
    navigator.clipboard.writeText(md);
    showToast("Copied Markdown table to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        compareCount={comparedProducts.length}
        onOpenCompareModal={() => setIsCompareOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={Boolean(apiKey && apiKey.trim())}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Scraper Input Form */}
        <ScraperForm
          onScrape={handleScrape}
          isLoading={isLoading}
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Warning Banner (e.g. anti-bot fallback notices) */}
        {warning && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-amber-900">Intelligent Scraper Fallback: </span>
              <span>{warning}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900 mb-1">Scraping Interrupted</p>
              <p>{error}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleScrape(currentMode === "url" ? "url" : "search", currentQuery, "com")}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Extraction
                </button>
                <button
                  onClick={() => setIsHtmlModalOpen(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                >
                  Paste Raw HTML Instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no data extracted yet */}
        {products.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-2xl mx-auto my-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Ready to Extract Amazon Data
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
              Enter a search keyword or paste an Amazon product URL above to extract real-time pricing in INR (₹), sizes, options, materials, and seller comparisons with Firecrawl.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleLoadPdfSoapDispenserRange}
                className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Load PDF Soap Dispenser Range Sample</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Results Header & Stats */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Extracted Amazon Data:</span>
                    <span className="text-blue-600 font-semibold truncate max-w-md">
                      "{currentQuery}"
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Displaying real-time specifications, sizes, fabrics, ratings, and pricing.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadPdfSoapDispenserRange}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Load Soap Dispenser Sample Dataset"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Load Soap Dispenser Sample</span>
                  </button>
                </div>
              </div>

              <StatsBar
                products={filteredAndSortedProducts}
                source={source}
                durationMs={durationMs}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                filterText={filterText}
                onFilterTextChange={setFilterText}
                primeOnly={primeOnly}
                onPrimeOnlyChange={setPrimeOnly}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                onExportMarkdown={handleExportMarkdown}
              />
            </div>

            {/* Product Display Section */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No products match your current filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Try adjusting your search keyword inside results, clearing the minimum rating, or turning off the Prime-only filter.
                </p>
                <button
                  onClick={() => {
                    setFilterText("");
                    setPrimeOnly(false);
                    setMinRating(0);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium border border-slate-200 transition-colors shadow-2xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                    isCompared={comparedProducts.some((p) => p.id === product.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <ProductTableView
                products={filteredAndSortedProducts}
                onSelect={setSelectedProduct}
                comparedIds={comparedProducts.map((p) => p.id)}
                onToggleCompare={handleToggleCompare}
              />
            )}
          </>
        )}
      </main>

      {/* Floating comparison drawer button when products are selected */}
      {comparedProducts.length > 0 && !isCompareOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {comparedProducts.length} Product{comparedProducts.length > 1 ? "s" : ""} in Comparison
          </span>
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Open Comparison Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => setComparedProducts([])}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-1"
            title="Clear comparison selection"
          >
            Clear
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-600">Amazon Web Scraping & Product Intelligence Tool</p>
          <div className="flex items-center gap-4 text-slate-400 font-normal">
            <span>Supports keywords & product URLs</span>
            <span>•</span>
            <span>Cheerio DOM + AI Grounding</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CompareModal
        isOpen={isCompareOpen}
        products={comparedProducts.length > 0 ? comparedProducts : products}
        onClose={() => setIsCompareOpen(false)}
        onRemove={handleRemoveCompare}
        onClear={() => {
          setComparedProducts([]);
          setIsCompareOpen(false);
        }}
      />

      <HtmlPasteModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        onParseHtml={handleParseRawHtml}
        isLoading={isLoading}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          setProducts(item.products);
          setCurrentQuery(item.queryOrUrl);
          setCurrentMode(item.mode);
          setSource("history");
        }}
        onClearHistory={() => setHistory([])}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={(newKey) => {
          setApiKey(newKey);
          showToast("API Key updated and ready for scraping!");
        }}
      />
    </div>
  );
}
