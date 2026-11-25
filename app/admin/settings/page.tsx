"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export default function AdminSettingsPage() {
  const [v, setV] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    (async () => {
      const res = await adminFetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setV((data.settings ?? DEFAULT_SETTINGS) as SiteSettings);
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "تعذر جلب الإعدادات");
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setSaved("");
    setError("");
    const res = await adminFetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify(v) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ الإعدادات");
    } else {
      setSaved("تم حفظ الإعدادات بنجاح ✓ — التغييرات هتظهر على الموقع فوراً");
    }
    setSaving(false);
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
  const labelCls = "mb-1.5 block text-sm font-bold text-ink dark:text-white";

  const fields: Array<{ key: keyof SiteSettings; label: string; placeholder: string; dir?: "ltr" }> = [
    { key: "store_name", label: "اسم المتجر", placeholder: "Pixo" },
    { key: "whatsapp_number", label: "رقم الواتساب / الموبايل", placeholder: "01117543009", dir: "ltr" },
    { key: "instapay_address", label: "عنوان إنستاباي", placeholder: "pixo@instapay", dir: "ltr" },
    { key: "vodafone_cash_number", label: "رقم فودافون كاش", placeholder: "01117543009", dir: "ltr" },
    { key: "facebook_url", label: "رابط فيسبوك", placeholder: "https://facebook.com/…", dir: "ltr" },
    { key: "instagram_url", label: "رابط إنستجرام", placeholder: "https://instagram.com/…", dir: "ltr" },
    { key: "tiktok_url", label: "رابط تيك توك", placeholder: "https://tiktok.com/@…", dir: "ltr" },
    { key: "announcement_text", label: "نص شريط الإعلانات أعلى الموقع", placeholder: "خصم لفترة محدودة…" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">الإعدادات</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="mt-6 space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label htmlFor={`st-${f.key}`} className={labelCls}>{f.label}</label>
              <input
                id={`st-${f.key}`}
                value={String(v[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
                className={inputCls}
                placeholder={f.placeholder}
                dir={f.dir}
                style={f.dir ? { textAlign: "right" } : undefined}
              />
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="st-hero_title" className={labelCls}>عنوان الواجهة الرئيسية (Hero)</label>
          <input id="st-hero_title" value={v.hero_title} onChange={(e) => set("hero_title", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="st-hero_subtitle" className={labelCls}>الوصف تحت العنوان الرئيسي</label>
          <textarea id="st-hero_subtitle" value={v.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} rows={3} className={inputCls} />
        </div>
        {saved && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-600 dark:bg-emerald-500/10">{saved}</p>}
        <button type="button" onClick={save} disabled={saving} className="w-full rounded-full bg-primary py-4 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60 sm:w-auto sm:px-10">
          {saving ? "جاري الحفظ…" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
