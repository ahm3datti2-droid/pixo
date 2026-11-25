"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { DELIVERY_TYPE_LABELS } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";

type Sort = "newest" | "price-asc" | "price-desc";

export default function ShopClient({
  products,
  categories,
  initialCategory,
}: {
  products: Product[];
  categories: Category[];
  initialCategory: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [delivery, setDelivery] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const selectedCat = categories.find((c) => c.slug === category);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim();
      const matchesQuery =
        !q || p.name.includes(q) || p.short_description.includes(q) || (p.category_name ?? "").includes(q);
      const matchesCategory =
        category === "all" ||
        !selectedCat ||
        p.category_id === selectedCat.id ||
        p.category_name === selectedCat.name;
      const matchesDelivery = delivery === "all" || p.delivery_type === delivery;
      return matchesQuery && matchesCategory && matchesDelivery;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => a.sort_order - b.sort_order);
    return list;
  }, [products, query, category, delivery, sort]);

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";

  return (
    <div>
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منتج… مثال: متجر، لوجو، منيو"
          className={inputCls}
          aria-label="ابحث عن منتج"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} aria-label="التصنيف">
            <option value="all">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={inputCls} aria-label="نوع المنتج">
            <option value="all">كل الأنواع</option>
            <option value="instant_download">{DELIVERY_TYPE_LABELS.instant_download}</option>
            <option value="service">{DELIVERY_TYPE_LABELS.service}</option>
            <option value="subscription">{DELIVERY_TYPE_LABELS.subscription}</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={inputCls} aria-label="الترتيب">
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === "all" ? "bg-primary text-white" : "bg-mist text-slate-600 hover:bg-primary-light dark:bg-white/10 dark:text-slate-300"}`}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === c.slug ? "bg-primary text-white" : "bg-mist text-slate-600 hover:bg-primary-light dark:bg-white/10 dark:text-slate-300"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {filtered.length === 0 ? "مفيش منتجات مطابقة لبحثك — جرّب كلمة تانية أو غيّر الفلاتر." : `عرض ${filtered.length} منتج`}
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
