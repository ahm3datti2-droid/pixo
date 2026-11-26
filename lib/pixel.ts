// Meta Pixel (Pixo) — the Pixel ID is public by design: it appears in the
// page source of every site that runs the Pixel, so it is kept here as a
// constant rather than an env var. Pixel created 2026-11-26 in the
// "خدمات التل الكبير" business portfolio, owner of the Pixo Page.
export const META_PIXEL_ID = "1837194463983879";

type Fbq = (action: "track" | "trackCustom", event: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Fire a Meta Pixel standard event. Safe to call before the Pixel loads — it no-ops. */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}
