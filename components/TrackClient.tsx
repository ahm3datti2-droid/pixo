"use client";

import { useState } from "react";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface TrackResult {
  order_number: string;
  product_name: string;
  package_name: string | null;
  status: OrderStatus;
  total: number;
  created_at: string;
  delivery_type: string;
  download_available: boolean;
}

export default function TrackClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadMsg, setDownloadMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setDownloadUrl("");
    setDownloadMsg("");
    if (!orderNumber.trim() || !phone.trim()) return setError("اكتب رقم الطلب ورقم الموبايل");
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "تعذر العثور على الطلب");
      setResult(data);
    } catch {
      setError("تعذر الاتصال بالسيرفر — حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!result) return;
    setDownloadMsg("جاري تجهيز رابط التحميل…");
    try {
      const res = await fetch(
        `/api/download?order=${encodeURIComponent(result.order_number)}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) return setDownloadMsg(data.error || "تعذر تجهيز رابط التحميل");
      setDownloadUrl(data.url);
      setDownloadMsg("الرابط جاهز — صالح لمدة 24 ساعة.");
      window.open(data.url, "_blank");
    } catch {
      setDownloadMsg("تعذر تجهيز رابط التحميل — حاول تاني");
    }
  }

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";

  const currentStep = result ? ORDER_STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tr-order" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">رقم الطلب *</label>
            <input id="tr-order" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className={inputCls} placeholder="مثال: PX-10023" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div>
            <label htmlFor="tr-phone" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">رقم الموبايل اللي طلبت بيه *</label>
            <input id="tr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" dir="ltr" style={{ textAlign: "right" }} />
          </div>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-primary py-3.5 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "جاري البحث…" : "عرض حالة الطلب"}
        </button>
      </form>

      {result && (
        <div className="mt-6 animate-fade-up rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">رقم الطلب</p>
              <p className="text-xl font-extrabold text-ink dark:text-white" dir="ltr">{result.order_number}</p>
            </div>
            <span className="rounded-full bg-primary-light px-4 py-2 text-sm font-bold text-primary dark:bg-primary/20 dark:text-violet-300">
              {ORDER_STATUS_LABELS[result.status]}
            </span>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-slate-400">المنتج</span><span className="font-bold text-ink dark:text-white">{result.product_name}{result.package_name ? ` — ${result.package_name}` : ""}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">الإجمالي</span><span className="font-bold text-ink dark:text-white">{formatPrice(result.total)}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">تاريخ الطلب</span><span className="font-bold text-ink dark:text-white">{new Date(result.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</span></p>
          </div>

          {result.status === "cancelled" ? (
            <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">
              الطلب ده ملغي. لو شايف إن فيه غلط، كلمنا على واتساب وهنساعدك.
            </p>
          ) : (
            <ol className="mt-6 space-y-0">
              {ORDER_STATUS_STEPS.map((step, i) => (
                <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
                  <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i <= currentStep ? "bg-primary text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}>
                    {i <= currentStep ? "✓" : i + 1}
                  </span>
                  {i < ORDER_STATUS_STEPS.length - 1 && (
                    <span className={`absolute right-4 top-8 h-full w-0.5 ${i < currentStep ? "bg-primary" : "bg-slate-200 dark:bg-white/10"}`} />
                  )}
                  <span className={`pt-1.5 text-sm font-bold ${i <= currentStep ? "text-ink dark:text-white" : "text-slate-400"}`}>
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {result.download_available && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="font-bold text-emerald-700 dark:text-emerald-300">ملفك جاهز للتحميل</p>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">اضغط على الزر لتحميل الملف — الرابط صالح لمدة 24 ساعة.</p>
              <button
                type="button"
                onClick={download}
                className="mt-3 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:brightness-95"
              >
                تحميل الملف الآن
              </button>
              {downloadMsg && <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{downloadMsg}</p>}
              {downloadUrl && (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-bold text-primary underline dark:text-accent">
                  فتح رابط التحميل في تبويب جديد
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
