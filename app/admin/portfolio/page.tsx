"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { PortfolioItem } from "@/lib/types";
import { getBrowserClient } from "@/lib/supabase";

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/portfolio");
    if (res.ok) {
      const data = await res.json();
      setItems((data.portfolio ?? []) as PortfolioItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "public-images");
    const supabase = getBrowserClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    const data = await res.json();
    if (res.ok && (data as { url?: string }).url) setImageUrl((data as { url: string }).url);
    else alert((data as { error?: string }).error ?? "تعذر رفع الصورة");
    setUploading(false);
  }

  function startEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setLink(item.link ?? "");
    setCategory(item.category ?? "");
    setImageUrl(item.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setLink("");
    setCategory("");
    setImageUrl("");
  }

  async function save() {
    if (!title.trim()) return setError("عنوان العمل مطلوب");
    setError("");
    const payload = { title: title.trim(), link: link.trim() || null, category: category.trim() || null, image_url: imageUrl, sort_order: items.length + 1 };
    const res = await adminFetch(
      editingId ? `/api/admin/portfolio/${editingId}` : "/api/admin/portfolio",
      { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ العمل");
      return;
    }
    resetForm();
    await load();
  }

  async function remove(id: string, itemTitle: string) {
    if (!confirm(`متأكد إنك عايز تمسح العمل «${itemTitle}»؟`)) return;
    setBusy(id);
    await adminFetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
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
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">الأعمال</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="mt-6 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="font-extrabold text-ink dark:text-white">{editingId ? "تعديل العمل" : "إضافة عمل جديد"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="عنوان العمل — مثال: متجر إلكتروني — ملابس" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="التصنيف — مثال: أنظمة ومواقع جاهزة" />
          <input value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="رابط العمل (اختياري) https://…" dir="ltr" style={{ textAlign: "right" }} />
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink dark:text-white">صورة العمل</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }}
              className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/20 dark:bg-white/5"
            />
          </div>
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="معاينة صورة العمل" className="h-32 w-48 rounded-2xl object-cover" />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={uploading} className="rounded-full bg-primary px-6 py-3 font-bold text-white disabled:opacity-60">
            {editingId ? "حفظ التعديلات" : "إضافة العمل"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-6 py-3 font-bold dark:border-white/15">إلغاء التعديل</button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-primary to-accent text-5xl font-extrabold text-white">
                {item.title.trim().charAt(0)}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-ink dark:text-white">{item.title}</h3>
              {item.category && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.category}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">تعديل</button>
                <button type="button" disabled={busy === item.id} onClick={() => remove(item.id, item.title)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 sm:col-span-2 lg:col-span-3 dark:border-white/15">مفيش أعمال لسه.</p>}
      </div>
    </div>
  );
}
