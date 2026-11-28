"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { DELIVERY_TYPE_LABELS, formatPrice, whatsappLink } from "@/lib/utils";
import ProductVisual from "./ProductVisual";

const WHATSAPP_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProductDetails({
  product,
  related,
  whatsappNumber,
}: {
  product: Product;
  related: Product[];
  whatsappNumber: string;
}) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const pkg = product.packages.find((p) => p.id === selectedPackage) ?? null;
  const price = pkg ? pkg.price : product.price;
  const hasPackages = product.packages.length > 0;
  const images = product.images ?? [];
  const checkoutHref = pkg
    ? `/checkout/${encodeURIComponent(product.slug)}?package=${encodeURIComponent(pkg.id)}`
    : `/checkout/${encodeURIComponent(product.slug)}`;
  const waMessage = `أهلاً Pixo، عايز أطلب: ${product.name}${pkg ? ` (باقة ${pkg.name})` : ""} — ${formatPrice(price)}`;
  const waHref = whatsappLink(whatsappNumber, waMessage);

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
            {product.is_new && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 font-bold text-white">جديد</span>
            )}
            {product.badge && (
              <span className="rounded-full bg-amber-500 px-3 py-1 font-bold text-white">{product.badge}</span>
            )}
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

          <div className="mt-6 hidden space-y-3 lg:block">
            <Link
              href={checkoutHref}
              className="block rounded-full bg-primary py-4 text-center text-lg font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
            >
              اطلب دلوقتي — {formatPrice(price)}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-center text-base font-extrabold text-white shadow-lg shadow-green-500/25 transition hover:brightness-95"
            >
              {WHATSAPP_ICON}
              اطلب على واتساب
            </a>
            <p className="text-center text-xs text-slate-400">الزر بيبعت رسالة جاهزة فيها اسم المنتج وسعره — من غير ما تملى فورم</p>
          </div>
        </div>
      </div>

      {/* Features + description — لو المنتج فيه «الباقة فيها إيه؟» بيحل محل كارت المميزات */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {product.details?.included ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-extrabold text-ink dark:text-white">{product.details.included.title}</h2>
            <ul className="mt-4 space-y-4">
              {product.details.included.items.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-500/20">✓</span>
                  <span className="leading-relaxed">
                    <span className="font-bold text-ink dark:text-white">{item.title}</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            {product.details.note && (
              <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-400 dark:border-white/10">
                {product.details.note}
              </p>
            )}
          </div>
        ) : (
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
        )}
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

      {/* Steps + tips — من details بتاع المنتج، بتظهر بس لو موجودة */}
      {product.details?.steps && (
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-ink dark:text-white">{product.details.steps.title}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {product.details.steps.items.map((step, i) => (
              <div
                key={step}
                className="relative rounded-3xl border border-slate-100 bg-mist p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white shadow-lg shadow-primary/30">
                  {i + 1}
                </div>
                <p className="mt-4 font-bold leading-relaxed text-ink dark:text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {product.details?.tips && (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <h2 className="text-xl font-extrabold text-ink dark:text-white">{product.details.tips.title}</h2>
          <ul className="mt-4 space-y-3">
            {product.details.tips.items.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-600 dark:text-amber-400">💡</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Product FAQ */}
      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-xl font-extrabold text-ink dark:text-white">أسئلة عن المنتج ده</h2>
        <div className="mt-5 space-y-3">
          {product.details?.faq?.map((item) => (
            <details key={item.q} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <summary className="cursor-pointer list-none font-bold text-ink dark:text-white">{item.q}</summary>
              <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">{item.a}</p>
            </details>
          ))}
          <details className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <summary className="cursor-pointer list-none font-bold text-ink dark:text-white">إزاي أطلب المنتج ده؟</summary>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              اضغط على زر «اطلب دلوقتي»، املى بياناتك، وادفع بإنستاباي أو فودافون كاش، وارفع سكرين شوت التحويل. هنأكد طلبك ونبدأ التنفيذ أو نبعت لك رابط التحميل. ولو تفضل تطلب من الواتساب على طول، زر «اطلب على واتساب» بيبعت رسالة جاهزة فيها اسم المنتج وسعره.
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
        <div className="flex items-center gap-2">
          <Link
            href={checkoutHref}
            className="flex-1 rounded-full bg-primary py-3.5 text-center text-base font-extrabold text-white shadow-lg shadow-primary/30"
          >
            اطلب دلوقتي — {formatPrice(price)}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="اطلب على واتساب"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/25"
          >
            {WHATSAPP_ICON}
          </a>
        </div>
      </div>
    </div>
  );
}
