import Link from "next/link";
import type { Product } from "@/lib/types";
import { DELIVERY_TYPE_LABELS, formatPrice } from "@/lib/utils";
import ProductVisual from "./ProductVisual";

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : 0;

  return (
    <Link
      href={`/products/${encodeURIComponent(product.slug)}`}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-white/5 dark:hover:shadow-black/40 ${
        product.highlighted
          ? "border-2 border-primary shadow-lg shadow-primary/20 dark:border-primary"
          : "border border-slate-100 dark:border-white/10"
      }`}
    >
      <div className="relative">
        <ProductVisual product={product} className="aspect-[16/10] w-full" />
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow">
            خصم {discount}%
          </span>
        )}
        {(product.badge || product.is_new) && (
          <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
                {product.badge}
              </span>
            )}
            {product.is_new && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
                جديد
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-primary-light px-2.5 py-1 font-semibold text-primary dark:bg-primary/20 dark:text-violet-300">
            {product.category_name ?? "عام"}
          </span>
          <span>{DELIVERY_TYPE_LABELS[product.delivery_type]}</span>
        </div>
        <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-primary dark:text-white dark:group-hover:text-accent">
          {product.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {product.short_description}
        </p>
        <div className="mt-2 flex items-end justify-between border-t border-slate-100 pt-3 dark:border-white/10">
          <div>
            {product.old_price && product.old_price > product.price && (
              <div className="text-xs text-slate-400 line-through">{formatPrice(product.old_price)}</div>
            )}
            <div className="text-xl font-extrabold text-primary dark:text-accent">
              {formatPrice(product.price)}
              {product.delivery_type === "subscription" && <span className="text-xs font-medium text-slate-400"> / شهرياً</span>}
            </div>
          </div>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition group-hover:bg-primary-dark">
            اطلب دلوقتي
          </span>
        </div>
      </div>
    </Link>
  );
}
