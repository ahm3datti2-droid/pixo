"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories((data.categories ?? []) as Category[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!newName.trim()) return;
    const res = await adminFetch("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: newName.trim(), sort_order: categories.length + 1 }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر إضافة التصنيف");
      return;
    }
    setNewName("");
    setError("");
    await load();
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return;
    const res = await adminFetch(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify({ name: editingName.trim() }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ التعديل");
      return;
    }
    setEditingId(null);
    await load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = categories.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= categories.length) return;
    const reordered = [...categories];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    setCategories(reordered);
    for (let i = 0; i < reordered.length; i++) {
      await adminFetch(`/api/admin/categories/${reordered[i].id}`, { method: "PATCH", body: JSON.stringify({ sort_order: i + 1 }) });
    }
    await load();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تمسح التصنيف «${name}»؟`)) return;
    const res = await adminFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حذف التصنيف");
      return;
    }
    await load();
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
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">التصنيفات</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="mt-6 flex gap-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="اسم تصنيف جديد… مثال: خدمات سوشيال ميديا"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
        />
        <button type="button" onClick={add} className="shrink-0 rounded-full bg-primary px-5 py-3 font-bold text-white">
          إضافة
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {categories.map((c, i) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            {editingId === c.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
                />
                <button type="button" onClick={() => saveEdit(c.id)} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">حفظ</button>
                <button type="button" onClick={() => setEditingId(null)} className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold dark:border-white/15">إلغاء</button>
              </div>
            ) : (
              <>
                <span className="font-bold text-ink dark:text-white">{c.name}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={i === 0} onClick={() => move(c.id, -1)} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-40 dark:border-white/15" aria-label="تحريك لأعلى">↑</button>
                  <button type="button" disabled={i === categories.length - 1} onClick={() => move(c.id, 1)} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-40 dark:border-white/15" aria-label="تحريك لأسفل">↓</button>
                  <button type="button" onClick={() => { setEditingId(c.id); setEditingName(c.name); }} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">تعديل</button>
                  <button type="button" onClick={() => remove(c.id, c.name)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">حذف</button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">مفيش تصنيفات لسه.</p>}
      </div>
    </div>
  );
}
