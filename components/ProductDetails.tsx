"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { DELIVERY_TYPE_LABELS, formatPrice } from "@/lib/utils";
import ProductVisual from "./ProductVisual";

export default function ProductDetails({ product, related }: { product: Product; related: Product[] }) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const pkg = product.packages.find((p) => p.id === selectedPackage) ?? null;
  const price = pkg ? pkg.price : product.price;
  const hasPackages = product.packages.length > 0;
  const images = product.images ?? [];
  const checkoutHref = pkg
    ? `/checkout/${encodeURIComponent(product.slug)}?package=${encodeURIComponent(pkg.id)}`
    : `/checkout/${encodeURIComponent(product.slug)}`;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm dark:border-white/10">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[activeImage]?.url} alt={product.name} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <ProductVisual product={product} className="aspect-[16/10] w-full" big />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((im, i) => (
                <button
                  key={im.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 ${i === activeImage ? "border-primary" : "border-transparent opacity-70"}`}
                  aria-label={`صورة ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary-light px-3 py-1 font-bold text-primary dark:bg-primary/20 dark:text-violet-300">
              {product.category_name ?? "عام"}
            </span>
            <span className="rounded-full bg-mist px-3 py-1 font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {DELIVERY_TYPE_LABELS[product.delivery_type]}
            </span>
            {product.delivery_time && (
              <span className="rounded-full bg-mist px-3 py-1 font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                التسليم: {product.delivery_time}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-snug text-ink dark:text-white">{product.name}</h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-500 dark:text-slate-400">{product.short_description}</p>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-primary dark:text-accent">{formatPrice(price)}</span>
            {product.old_price && product.old_price > product.price && !pkg && (
              <span className="pb-1 text-lg text-slate-400 line-through">{formatPrice(product.old_price)}</span>
            )}
            {product.delivery_type === "subscription" && <span className="pb-1 text-sm text-slate-400">/ شهرياً</span>}
          </div>

          {hasPackages && (
            <div className="mt-6">
              <h2 className="font-bold text-ink dark:text-white">اختار الباقة المناسبة ليك:</h2>
              <div className="mt-3 space-y-3">
                {product.packages.map((p) => {
                  const chosen = pkg ? pkg.id === p.id : false;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPackage(p.id)}
                      className={`w-full rounded-2xl border-2 p-4 text-right transition ${
                        chosen ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 bg-white hover:border-primary/50 dark:border-white/15 dark:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-bold text-ink dark:text-white">{p.name}</span>
                        <span className="font-extrabold text-primary dark:text-accent">{formatPrice(p.price)}</span>
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {p.features.join(" • ")}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className={`w-full rounded-2xl border-2 p-4 text-right transition ${
                    !pkg ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 bg-white hover:border-primary/50 dark:border-white/15 dark:bg-white/5"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-bold text-ink dark:text-white">السعر الأساسي</span>
                    <span className="font-extrabold text-primary dark:text-accent">{formatPrice(product.price)}</span>
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {product.features.slice(0, 3).join(" • ")}
                  </span>
                </button>
              </div>
            </div>
          )}

          {product.demo_url && (
            <a
              href={product.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 font-bold text-primary transition hover:bg-primary-light dark:text-accent dark:hover:bg-white/10"
            >
              ▶ معاينة حية (Demo)
            </a>
          )}

          <div className="mt-6 hidden lg:block">
            <Link
              href={checkoutHref}
              className="block rounded-full bg-primary py-4 text-center text-lg font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
            >
              اطلب دلوقتي — {formatPrice(price)}
            </Link>
          </div>
        </div>
      </div>

      {/* Features + description */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-xl font-extrabold text-ink dark:text-white">هتاخد إيه بالظبط؟</h2>
          <ul className="mt-4 space-y-3">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-500/20">✓</span>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-xl font-extrabold text-ink dark:text-white">تفاصيل المنتج</h2>
          {product.description.split("\n").map((para, i) => (
            <p key={i} className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
              {para}
            </p>
          ))}
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-white/10">
            <p className="flex justify-between"><span className="text-slate-400">نوع المنتج</span><span className="font-bold text-ink dark:text-white">{DELIVERY_TYPE_LABELS[product.delivery_type]}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">مدة التسليم</span><span className="font-bold text-ink dark:text-white">{product.delivery_time ?? "حسب الاتفاق"}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">الدفع</span><span className="font-bold text-ink dark:text-white">إنستاباي أو فودافون كاش</span></p>
          </div>
        </div>
      </div>

      {/* Product FAQ */}
      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-xl font-extrabold text-ink dark:text-white">أسئلة عن المنتج ده</h2>
        <div className="mt-5 space-y-3">
          <details className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <summary className="cursor-pointer list-none font-bold text-ink dark:text-white">إزاي أطلب المنتج ده؟</summary>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              اضغط على زر «اطلب دلوقتي»، املى بياناتك، وادفع بإنستاباي أو فودافون كاش، وارفع سكرين شوت التحويل. هنأكد طلبك ونبدأ التنفيذ أو نبعت لك رابط التحميل.
            </p>
          </details>
          <details className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <summary className="cursor-pointer list-none font-bold text-ink dark:text-white">هستلم إمتى؟</summary>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              {product.delivery_type === "instant_download"
                ? "التحميل فوري — أول ما نأكد الدفع بيوصلك رابط التحميل، وتقدر تنزله من صفحة تتبع طلبك."
                : `مدة التسليم هي ${product.delivery_time ?? "حسب الاتفاق"} من تأكيد الدفع، وهنبلغك بكل خطوة على واتساب.`}
            </p>
          </details>
          <details className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <summary className="cursor-pointer list-none font-bold text-ink dark:text-white">أقدر أتابع طلبي؟</summary>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              أيوه، من صفحة «تتبع طلبك» برقم الطلب ورقم موبايلك هتشوف حالة الطلب لحظة بلحظة.
            </p>
          </details>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-extrabold text-ink dark:text-white">منتجات مشابهة</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${encodeURIComponent(p.slug)}`}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <ProductVisual product={p} className="aspect-[16/10] w-full" />
                <div className="p-5">
                  <h3 className="font-bold text-ink group-hover:text-primary dark:text-white dark:group-hover:text-accent">{p.name}</h3>
                  <p className="mt-2 text-lg font-extrabold text-primary dark:text-accent">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile order button */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-night/95 lg:hidden">
        <Link
          href={checkoutHref}
          className="block rounded-full bg-primary py-3.5 text-center text-base font-extrabold text-white shadow-lg shadow-primary/30"
        >
          اطلب دلوقتي — {formatPrice(price)}
        </Link>
      </div>
    </div>
  );
}
