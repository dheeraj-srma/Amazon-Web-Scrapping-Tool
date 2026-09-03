import { AmazonProduct } from "../types";

export function exportToJson(products: AmazonProduct[], filename = "amazon-scraped-products.json") {
  const jsonStr = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(products: AmazonProduct[], filename = "amazon-scraped-products.csv") {
  if (products.length === 0) return;

  const headers = [
    "ASIN",
    "Title",
    "Price",
    "Currency",
    "Original Price",
    "Rating",
    "Review Count",
    "Sizes",
    "Materials",
    "Brand",
    "Is Prime",
    "In Stock",
    "URL",
    "Image URL"
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = products.map((p) => [
    escapeCsv(p.asin || ""),
    escapeCsv(p.title),
    escapeCsv(p.price !== null ? p.price : ""),
    escapeCsv(p.currency),
    escapeCsv(p.originalPrice !== null ? p.originalPrice : ""),
    escapeCsv(p.rating !== null ? p.rating : ""),
    escapeCsv(p.reviewCount !== null ? p.reviewCount : ""),
    escapeCsv(p.sizes?.join("; ") || ""),
    escapeCsv(p.materials?.join("; ") || ""),
    escapeCsv(p.brand || ""),
    escapeCsv(p.isPrime ? "Yes" : "No"),
    escapeCsv(p.inStock ? "Yes" : "No"),
    escapeCsv(p.url),
    escapeCsv(p.image)
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateMarkdownTable(products: AmazonProduct[]): string {
  if (products.length === 0) return "No products found.";

  let md = `| ASIN | Title | Price | Rating | Sizes | Materials |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const p of products) {
    const cleanTitle = p.title.length > 40 ? p.title.slice(0, 40) + "..." : p.title;
    const priceStr = p.price !== null ? `${p.currency}${p.price.toFixed(2)}` : "N/A";
    const ratingStr = p.rating !== null ? `★ ${p.rating} (${p.reviewCount || 0})` : "N/A";
    const sizesStr = p.sizes?.slice(0, 3).join(", ") || "N/A";
    const matsStr = p.materials?.slice(0, 2).join(", ") || "N/A";
    md += `| ${p.asin || "-"} | [${cleanTitle.replace(/\|/g, "/")}](${p.url}) | ${priceStr} | ${ratingStr} | ${sizesStr} | ${matsStr} |\n`;
  }

  return md;
}
