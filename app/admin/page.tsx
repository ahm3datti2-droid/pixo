"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-client";
import type { Order } from "@/lib/types";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "تعذر جلب الطلبات");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOrders((data.orders ?? []) as Order[]);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;
  const ordersMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "in_progress" || o.status === "delivered");
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const latest = orders.slice(0, 10);

  const stats = [
    { label: "طلبات النهاردة", value: String(ordersToday), icon: "📦" },
    { label: "طلبات الشهر", value: String(ordersMonth), icon: "🗓️" },
    { label: "إيرادات الطلبات المدفوعة", value: formatPrice(revenue), icon: "💰" },
    { label: "طلبات بانتظار التأكيد", value: String(pendingCount), icon: "⏳" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">نظرة عامة</h1>
      {error && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {error} — لو دي أول مرة، اتأكد إنك نفذت schema.sql في Supabase وضفت إيميلك في ADMIN_EMAILS.
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="text-2xl">{s.icon}</div>
            <p className="mt-2 text-2xl font-extrabold text-ink dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink dark:text-white">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline dark:text-accent">
            عرض كل الطلبات ←
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="py-8 text-center text-slate-400">لسه مفيش طلبات — أول ما حد يطلب هتظهر هنا.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-white/10">
                  <th className="py-3 font-semibold">رقم الطلب</th>
                  <th className="py-3 font-semibold">العميل</th>
                  <th className="py-3 font-semibold">المنتج</th>
                  <th className="py-3 font-semibold">الإجمالي</th>
                  <th className="py-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="py-3 font-bold text-primary dark:text-accent" dir="ltr">
                      <Link href={`/admin/orders/${o.id}`}>{o.order_number}</Link>
                    </td>
                    <td className="py-3 text-ink dark:text-white">{o.customer_name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{o.product_name}</td>
                    <td className="py-3 font-bold text-ink dark:text-white">{formatPrice(o.total)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-violet-300">
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
