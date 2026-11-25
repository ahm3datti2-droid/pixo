"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الطلبات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "paid", label: "تم تأكيد الدفع" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "تعذر جلب الطلبات");
      } else {
        const data = await res.json();
        setOrders((data.orders ?? []) as Order[]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return orders.filter((o) => {
      const okStatus = status === "all" || o.status === (status as OrderStatus);
      const okQuery = !q || o.order_number.includes(q) || o.phone.includes(q) || o.customer_name.includes(q);
      return okStatus && okQuery;
    });
  }, [orders, status, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">الطلبات ({filtered.length})</h1>
      {error && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{error}</p>}

      <div className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 dark:border-white/10 dark:bg-white/5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث برقم الطلب أو رقم الموبايل أو اسم العميل…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">
          مفيش طلبات مطابقة.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-primary/40 sm:p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-primary dark:text-accent" dir="ltr">{o.order_number}</span>
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-violet-300">
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
              <p className="mt-2 font-bold text-ink dark:text-white">{o.customer_name} <span className="font-normal text-slate-400" dir="ltr">{o.phone}</span></p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {o.product_name}{o.package_name ? ` — ${o.package_name}` : ""} • {formatPrice(o.total)} • {new Date(o.created_at).toLocaleDateString("ar-EG")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
