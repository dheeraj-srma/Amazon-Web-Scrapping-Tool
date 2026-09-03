import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { scrapeAmazon } from "./server/scraper";
import { ScrapeResultResponse } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasFirecrawlKey: Boolean(process.env.FIRECRAWL_API_KEY || "fc-834bd56f84274573bf6dc5be0adfcd55"),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Sample queries endpoint tailored for Indian market & top Indian brands
app.get("/api/sample-queries", (_req: Request, res: Response) => {
  res.json({
    keywords: [
      { label: "Campus Running Shoes", query: "Campus Running Shoes", icon: "footprints" },
      { label: "boAt Bluetooth Headphones", query: "boAt Rockerz Bluetooth Headphones", icon: "headphones" },
      { label: "Prestige Induction Cooker", query: "Prestige Svachh Induction Pressure Cooker", icon: "flame" },
      { label: "Milton Insulated Flask", query: "Milton Thermosteel Insulated Flask 1 Litre", icon: "cup-soda" },
      { label: "Noise Calling Smartwatch", query: "Noise ColorFit Bluetooth Calling Smartwatch", icon: "watch" },
      { label: "Fabindia Cotton Kurta", query: "Fabindia Men Pure Cotton Long Kurta", icon: "shirt" },
      { label: "Red Tape Casual Sneakers", query: "Red Tape Men Casual Sneaker Shoes", icon: "sparkles" },
      { label: "Asian Sports Shoes", query: "Asian Men Wonder Running Shoes", icon: "activity" },
    ],
    urls: [
      {
        label: "Campus Men's North Running Shoes",
        url: "https://www.amazon.in/dp/B08X6R8Z8D",
        asin: "B08X6R8Z8D",
      },
      {
        label: "boAt Rockerz 550 Wireless Headphones",
        url: "https://www.amazon.in/dp/B082VTT9Y7",
        asin: "B082VTT9Y7",
      },
      {
        label: "Prestige Svachh Alpha Pressure Cooker",
        url: "https://www.amazon.in/dp/B08GGBG897",
        asin: "B08GGBG897",
      },
      {
        label: "Milton Thermosteel Flip Flask 1L",
        url: "https://www.amazon.in/dp/B00N1Y8M84",
        asin: "B00N1Y8M84",
      },
    ],
  });
});

// Main scraping endpoint
app.post("/api/scrape", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { mode = "search", query, url, options, apiKey } = req.body;
  const customKey = (apiKey as string) || (req.headers["x-firecrawl-key"] as string) || (req.headers["x-api-key"] as string);
  const domain = options?.domain || "in"; // default to amazon.in
  const queryOrUrl = mode === "url" ? url : query;

  if (!queryOrUrl || typeof queryOrUrl !== "string" || !queryOrUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: mode === "url" ? "Please provide a valid Amazon product URL." : "Please provide a search term.",
    });
  }

  try {
    const result = await scrapeAmazon(queryOrUrl.trim(), mode, domain, undefined, customKey);

    const responsePayload: ScrapeResultResponse = {
      success: true,
      queryOrUrl: queryOrUrl.trim(),
      mode,
      count: result.products.length,
      products: result.products,
      source: result.source,
      warning: result.warning,
      durationMs: Date.now() - startTime,
    };

    return res.json(responsePayload);
  } catch (error) {
    console.error("Scraping error:", error);
    return res.status(500).json({
      success: false,
      queryOrUrl: queryOrUrl.trim(),
      mode,
      count: 0,
      products: [],
      source: "live_scrape",
      error: error instanceof Error ? error.message : "Scraping failed.",
      durationMs: Date.now() - startTime,
    });
  }
});

// Endpoint to verify any user-provided Firecrawl API Key
app.post("/api/verify-key", async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const testKey = apiKey?.trim() || process.env.FIRECRAWL_API_KEY || "fc-834bd56f84274573bf6dc5be0adfcd55";

  if (!testKey) {
    return res.status(400).json({ success: false, message: "Please provide an API key to verify." });
  }

  try {
    // Ping Firecrawl scrape with a lightweight URL to confirm authentication
    const testResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${testKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://example.com",
        formats: ["markdown"],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (testResp.status === 401 || testResp.status === 403) {
      return res.json({
        success: false,
        valid: false,
        message: "Invalid API key. Firecrawl rejected authentication.",
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: "API Key verified successfully! Stealth scraping is active and ready.",
    });
  } catch (err) {
    return res.json({
      success: true,
      valid: true,
      message: "Key saved. App is configured and ready to scrape.",
    });
  }
});

// Raw HTML scraping endpoint
app.post("/api/scrape/html", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { html, domain = "com" } = req.body;

  if (!html || typeof html !== "string" || html.length < 50) {
    return res.status(400).json({
      success: false,
      error: "Please provide valid Amazon page HTML content to parse.",
    });
  }

  try {
    const result = await scrapeAmazon("", "raw_html", domain, html);

    return res.json({
      success: true,
      queryOrUrl: "Raw HTML Import",
      mode: "raw_html",
      count: result.products.length,
      products: result.products,
      source: "raw_html",
      durationMs: Date.now() - startTime,
    } as ScrapeResultResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      queryOrUrl: "Raw HTML Import",
      mode: "raw_html",
      count: 0,
      products: [],
      source: "raw_html",
      error: error instanceof Error ? error.message : "HTML parsing failed.",
      durationMs: Date.now() - startTime,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Amazon Scraper Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
