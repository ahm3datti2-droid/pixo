"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Coupon } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [expiry, setExpiry] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/coupons");
    if (res.ok) {
      const data = await res.json();
      setCoupons((data.coupons ?? []) as Coupon[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!code.trim()) return setError("اكتب كود الكوبون");
    if (value <= 0) return setError("قيمة الخصم لازم تكون أكبر من صفر");
    if (type === "percent" && value > 100) return setError("النسبة المئوية مش ممكن تتعدى 100%");
    setError("");
    const res = await adminFetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: code.trim(),
        discount_type: type,
        discount_value: value,
        expires_at: expiry || null,
        max_uses: maxUses ? Number(maxUses) : null,
        is_active: true,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر إضافة الكوبون");
      return;
    }
    setCode("");
    setValue(10);
    setExpiry("");
    setMaxUses("");
    await load();
  }

  async function toggle(c: Coupon) {
    setBusy(c.id);
    await adminFetch(`/api/admin/coupons/${c.id}`, { method: "PATCH", body: JSON.stringify({ is_active: !c.is_active }) });
    await load();
    setBusy("");
  }

  async function remove(id: string, couponCode: string) {
    if (!confirm(`متأكد إنك عايز تمسح الكوبون ${couponCode}؟`)) return;
    setBusy(id);
    await adminFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    await load();
    setBusy("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">الكوبونات</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="font-extrabold text-ink dark:text-white">إضافة كوبون جديد</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputCls} placeholder="الكود — مثال: PIXO10" dir="ltr" style={{ textAlign: "right" }} />
          <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")} className={inputCls}>
            <option value="percent">نسبة مئوية %</option>
            <option value="fixed">مبلغ ثابت (ج.م)</option>
          </select>
          <input type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className={inputCls} placeholder={type === "percent" ? "مثال: 10" : "مثال: 200"} />
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputCls} aria-label="تاريخ الانتهاء" />
          <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputCls} placeholder="أقصى عدد استخدامات (اختياري)" />
          <button type="button" onClick={add} className="rounded-full bg-primary py-3 font-bold text-white transition hover:bg-primary-dark">
            إضافة الكوبون
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div>
              <span className="font-extrabold text-primary dark:text-accent" dir="ltr">{c.code}</span>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {c.discount_type === "percent" ? `خصم ${c.discount_value}%` : `خصم ${formatPrice(c.discount_value)}`}
                {c.expires_at ? ` • ينتهي ${new Date(c.expires_at).toLocaleDateString("ar-EG")}` : " • بدون تاريخ انتهاء"}
                {c.max_uses ? ` • استُخدم ${c.uses_count} من ${c.max_uses}` : ` • استُخدم ${c.uses_count} مرة`}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={busy === c.id} onClick={() => toggle(c)} className={`rounded-full px-4 py-2 text-sm font-bold ${c.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}>
                {c.is_active ? "● مفعّل" : "○ متوقف"}
              </button>
              <button type="button" disabled={busy === c.id} onClick={() => remove(c.id, c.code)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">حذف</button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">مفيش كوبونات لسه.</p>}
      </div>
    </div>
  );
}
