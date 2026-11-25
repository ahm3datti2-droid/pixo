import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://pixo.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/products", "/works", "/about", "/contact", "/track", "/terms", "/privacy", "/refund"];
  const entries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
  const products = await fetchProducts();
  for (const product of products) {
    entries.push({
      url: `${BASE}/products/${encodeURIComponent(product.slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }
  return entries;
}
