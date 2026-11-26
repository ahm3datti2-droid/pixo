"use client";

import { useEffect, useRef } from "react";
import { trackPixel } from "@/lib/pixel";

// Fires one Meta Pixel standard event once when the page mounts.
// Used from server pages (product page, checkout page) for ViewContent
// and InitiateCheckout.
export default function PixelEvent({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackPixel(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
