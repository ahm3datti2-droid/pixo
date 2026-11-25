"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import type { Category, DeliveryType } from "@/lib/types";
import { slugify } from "@/lib/utils";

export interface ProductFormValue {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  delivery_type: DeliveryType;
  short_description: string;
  description: string;
  features: string[];
  price: number;
  old_price: string;
  demo_url: string;
  delivery_time: string;
  download_file_path: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  images: string[];
  packages: Array<{ name: string; price: number; features: string }>;
}

interface DbProductRow {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  delivery_type: DeliveryType;
  short_description: string;
  description: string;
  features: string[];
  price: number;
  old_price: number | null;
  demo_url: string | null;
  delivery_time: string | null;
  download_file_path: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  product_images?: Array<{ url: string }>;
  packages?: Array<{ name: string; price: number; features: string[] }>;
}

export function toFormValue(row: DbProductRow): ProductFormValue {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category_id: row.category_id ?? "",
    delivery_type: row.delivery_type,
    short_description: row.short_description ?? "",
    description: row.description ?? "",
    features: row.features ?? [],
    price: row.price,
    old_price: row.old_price != null ? String(row.old_price) : "",
    demo_url: row.demo_url ?? "",
    delivery_time: row.delivery_time ?? "",
    download_file_path: row.download_file_path ?? "",
    is_active: row.is_active,
    is_featured: row.is_featured,
    sort_order: row.sort_order ?? 0,
    images: (row.product_images ?? []).map((im) => im.url),
    packages: (row.packages ?? []).map((p) => ({ name: p.name, price: p.price, features: (p.features ?? []).join("\n") })),
  };
}

const EMPTY: ProductFormValue = {
  name: "",
  slug: "",
  category_id: "",
  delivery_type: "service",
  short_description: "",
  description: "",
  features: [],
  price: 0,
  old_price: "",
  demo_url: "",
  delivery_time: "",
  download_file_path: "",
  is_active: true,
  is_featured: false,
  sort_order: 0,
  images: [],
  packages: [],
};

export default function ProductForm({ initial, categories }: { initial?: ProductFormValue; categories: Category[] }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValue>(initial ?? EMPTY);
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  function set<K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File, bucket: "public-images" | "downloads"): Promise<{ url?: string; path?: string } | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      headers: await authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      alert((data as { error?: string }).error ?? "تعذر رفع الملف");
      return null;
    }
    return data as { url?: string; path?: string };
  }

  async function authHeaders(): Promise<Record<string, string>> {
    const { getBrowserClient } = await import("@/lib/supabase");
    const supabase = getBrowserClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const result = await uploadFile(file, "public-images");
      if (result?.url) setV((prev) => ({ ...prev, images: [...prev.images, result.url as string] }));
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDownloadUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file, "downloads");
    if (result?.path) set("download_file_path", result.path);
    setUploading(false);
    e.target.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!v.name.trim()) return setError("اسم المنتج مطلوب");
    if (v.price < 0) return setError("السعر غير صحيح");
    setSaving(true);
    const payload = {
      ...v,
      slug: v.slug.trim() || slugify(v.name),
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
      old_price: v.old_price === "" ? null : Number(v.old_price),
      packages: v.packages
        .filter((p) => p.name.trim())
        .map((p) => ({ name: p.name.trim(), price: Number(p.price) || 0, features: p.features.split("\n").map((s) => s.trim()).filter(Boolean) })),
    };
    const isEdit = Boolean(v.id);
    const res = await adminFetch(isEdit ? `/api/admin/products/${v.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ المنتج");
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";
  const labelCls = "mb-1.5 block text-sm font-bold text-ink dark:text-white";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-extrabold text-ink dark:text-white">البيانات الأساسية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-name" className={labelCls}>اسم المنتج *</label>
            <input
              id="pf-name"
              value={v.name}
              onChange={(e) => {
                const name = e.target.value;
                setV((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
              }}
              className={inputCls}
              placeholder="مثال: متجر إلكتروني بطلب على واتساب"
            />
          </div>
          <div>
            <label htmlFor="pf-slug" className={labelCls}>السلاج (رابط المنتج)</label>
            <input id="pf-slug" value={v.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className={inputCls} placeholder="بيتولد تلقائي من الاسم" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div>
            <label htmlFor="pf-cat" className={labelCls}>التصنيف</label>
            <select id="pf-cat" value={v.category_id} onChange={(e) => set("category_id", e.target.value)} className={inputCls}>
              <option value="">بدون تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-type" className={labelCls}>نوع المنتج</label>
            <select id="pf-type" value={v.delivery_type} onChange={(e) => set("delivery_type", e.target.value as DeliveryType)} className={inputCls}>
              <option value="service">خدمة منفذة لك</option>
              <option value="instant_download">تحميل فوري</option>
              <option value="subscription">اشتراك شهري</option>
            </select>
          </div>
          <div>
            <label htmlFor="pf-price" className={labelCls}>السعر (ج.م) *</label>
            <input id="pf-price" type="number" min={0} value={v.price} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pf-old" className={labelCls}>السعر قبل الخصم (اختياري)</label>
            <input id="pf-old" type="number" min={0} value={v.old_price} onChange={(e) => set("old_price", e.target.value)} className={inputCls} placeholder="سيبه فاضي لو مفيش خصم" />
          </div>
          <div>
            <label htmlFor="pf-time" className={labelCls}>مدة التسليم</label>
            <input id="pf-time" value={v.delivery_time} onChange={(e) => set("delivery_time", e.target.value)} className={inputCls} placeholder="مثال: 3 أيام / فوري / شهري" />
          </div>
          <div>
            <label htmlFor="pf-demo" className={labelCls}>رابط المعاينة الحية (Demo) — اختياري</label>
            <input id="pf-demo" value={v.demo_url} onChange={(e) => set("demo_url", e.target.value)} className={inputCls} placeholder="https://…" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div>
            <label htmlFor="pf-order" className={labelCls}>ترتيب العرض</label>
            <input id="pf-order" type="number" value={v.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-ink dark:text-white">
              <input type="checkbox" checked={v.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-5 w-5 accent-[#6C4DFF]" />
              ظاهر للعملاء
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-ink dark:text-white">
              <input type="checkbox" checked={v.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-5 w-5 accent-[#6C4DFF]" />
              منتج مميز
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-extrabold text-ink dark:text-white">الوصف والمميزات</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="pf-short" className={labelCls}>وصف قصير</label>
            <input id="pf-short" value={v.short_description} onChange={(e) => set("short_description", e.target.value)} className={inputCls} placeholder="سطر واحد يشرح المنتج" />
          </div>
          <div>
            <label htmlFor="pf-desc" className={labelCls}>الوصف الكامل</label>
            <textarea id="pf-desc" value={v.description} onChange={(e) => set("description", e.target.value)} rows={5} className={inputCls} placeholder="اكتب وصف كامل وواضح للمنتج — فقرتين أو تلاتة" />
          </div>
          <div>
            <label htmlFor="pf-features" className={labelCls}>المميزات — كل ميزة في سطر لوحده (دي اللي بتظهر في «هتاخد إيه بالظبط»)</label>
            <textarea id="pf-features" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={5} className={inputCls} placeholder={"تصميم متجاوب\nإضافة حتى 50 منتج\nطلب على واتساب"} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-extrabold text-ink dark:text-white">الصور</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploading}
          className="mt-4 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/20 dark:bg-white/5"
        />
        {uploading && <p className="mt-2 text-sm text-primary">جاري رفع الصور…</p>}
        {v.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {v.images.map((url, i) => (
              <div key={url + i} className="relative h-24 w-32 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set("images", v.images.filter((_, j) => j !== i))}
                  className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
                  aria-label="حذف الصورة"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {v.delivery_type === "instant_download" && (
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/10">
            <h3 className="font-bold text-ink dark:text-white">ملف التحميل (للمنتجات الفورية)</h3>
            <input
              type="file"
              onChange={handleDownloadUpload}
              disabled={uploading}
              className="mt-3 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/20 dark:bg-white/5"
            />
            {v.download_file_path && (
              <p className="mt-2 break-all text-sm text-emerald-600">ملف مرفوع: {v.download_file_path}</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink dark:text-white">الباقات (اختياري)</h2>
          <button
            type="button"
            onClick={() => set("packages", [...v.packages, { name: "", price: 0, features: "" }])}
            className="rounded-full bg-primary-light px-4 py-2 text-sm font-bold text-primary dark:bg-primary/20 dark:text-violet-300"
          >
            + إضافة باقة
          </button>
        </div>
        {v.packages.length === 0 && <p className="mt-3 text-sm text-slate-400">مفيش باقات — العميل هيطلب بالسعر الأساسي.</p>}
        <div className="mt-4 space-y-4">
          {v.packages.map((p, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={p.name} onChange={(e) => { const pkgs = [...v.packages]; pkgs[i] = { ...pkgs[i], name: e.target.value }; set("packages", pkgs); }} className={inputCls} placeholder="اسم الباقة" />
                <input type="number" min={0} value={p.price} onChange={(e) => { const pkgs = [...v.packages]; pkgs[i] = { ...pkgs[i], price: Number(e.target.value) }; set("packages", pkgs); }} className={inputCls} placeholder="سعر الباقة" />
              </div>
              <textarea value={p.features} onChange={(e) => { const pkgs = [...v.packages]; pkgs[i] = { ...pkgs[i], features: e.target.value }; set("packages", pkgs); }} rows={3} className={`${inputCls} mt-3`} placeholder="مميزات الباقة — كل ميزة في سطر" />
              <button type="button" onClick={() => set("packages", v.packages.filter((_, j) => j !== i))} className="mt-2 text-sm font-bold text-rose-500">
                حذف الباقة
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="flex-1 rounded-full bg-primary py-4 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60">
          {saving ? "جاري الحفظ…" : v.id ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-full border border-slate-200 bg-white px-6 py-4 font-bold text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
          إلغاء
        </button>
      </div>
    </form>
  );
}
