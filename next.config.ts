import type { NextConfig } from "next";

/**
 * الترويسات الأمنية (M-1 + L-3 + I-1):
 * - CSP: بيسمح بـ Meta Pixel (connect.facebook.net + facebook.com/tr)
 *   وباتصال Supabase (auth + قراءة عامة) — الخطوط self-hosted عبر
 *   next/font/google فمش محتاجة أي مصدر خارجي.
 * - frame-ancestors 'none' + X-Frame-Options: DENY → مفيش clickjacking
 *   (حتى صفحة دخول الأدمن مينفعش تتضمّن في iframe).
 * - HSTS مع includeSubDomains وpreload.
 * - poweredByHeader: false → إخفاء X-Powered-By: Next.js.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.facebook.com https://*.supabase.co",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
