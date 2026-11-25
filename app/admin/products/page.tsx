"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-client";
import { formatPrice } from "@/lib/utils";

interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  categories?: { name?: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/products");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر جلب المنتجات");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProducts((data.products ?? []) as AdminProductRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, payload: Record<string, unknown>) {
    setBusy(id);
    const res = await adminFetch(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert((data as { error?: string }).error ?? "تعذر حفظ التعديل");
    } else {
      await load();
    }
    setBusy("");
  }

  async function duplicate(id: string) {
    setBusy(id);
    const res = await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify({ duplicate_id: id }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert((data as { error?: string }).error ?? "تعذر نسخ المنتج");
    } else {
      await load();
    }
    setBusy("");
  }

  async function remove(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تمسح المنتج «${name}»؟ الإجراء ده مش بيرجع.`)) return;
    setBusy(id);
    const res = await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert((data as { error?: string }).error ?? "تعذر حذف المنتج");
    } else {
      await load();
    }
    setBusy("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink dark:text-white">المنتجات ({products.length})</h1>
        <Link href="/admin/products/new" className="rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow transition hover:bg-primary-dark">
          + إضافة منتج جديد
        </Link>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{error}</p>}
      {products.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">
          مفيش منتجات لسه — اضغط «إضافة منتج جديد» عشان تضيف أول منتج.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-ink dark:text-white">{p.name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {p.categories?.name ?? "بدون تصنيف"} • {formatPrice(p.price)}
                    {p.old_price ? ` • قبل: ${formatPrice(p.old_price)}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => patch(p.id, { is_active: !p.is_active })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${p.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}
                    >
                      {p.is_active ? "● ظاهر" : "○ مخفي"}
                    </button>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => patch(p.id, { is_featured: !p.is_featured })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${p.is_featured ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}
                    >
                      {p.is_featured ? "★ مميز" : "☆ مش مميز"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/products/${p.id}/edit`} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">
                    تعديل
                  </Link>
                  <button type="button" disabled={busy === p.id} onClick={() => duplicate(p.id)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                    نسخ
                  </button>
                  <button type="button" disabled={busy === p.id} onClick={() => remove(p.id, p.name)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
