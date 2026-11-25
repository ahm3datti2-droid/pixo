"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Testimonial } from "@/lib/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/testimonials");
    if (res.ok) {
      const data = await res.json();
      setItems((data.testimonials ?? []) as Testimonial[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: Testimonial) {
    setEditingId(item.id);
    setName(item.name);
    setRole(item.role ?? "");
    setText(item.text);
    setRating(item.rating);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setRole("");
    setText("");
    setRating(5);
  }

  async function save() {
    if (!name.trim() || !text.trim()) return setError("اسم العميل ونص الرأي مطلوبين");
    setError("");
    const payload = { name: name.trim(), role: role.trim() || null, text: text.trim(), rating };
    const res = await adminFetch(
      editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials",
      { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ الرأي");
      return;
    }
    resetForm();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("متأكد إنك عايز تمسح الرأي ده؟")) return;
    setBusy(id);
    await adminFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
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
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">آراء العملاء</h1>
      <p className="mt-2 rounded-2xl bg-mist p-4 text-sm leading-relaxed text-slate-500 dark:bg-white/10 dark:text-slate-400">
        القسم ده بيظهر على الموقع بس لما تضيف آراء حقيقية من عملاء فعليين. متضيفش أي رأي أو اسم مش حقيقي.
      </p>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div className="mt-6 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="font-extrabold text-ink dark:text-white">{editingId ? "تعديل الرأي" : "إضافة رأي حقيقي"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="اسم العميل الحقيقي" />
          <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} placeholder="صفته أو بيزنسه (اختياري)" />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} placeholder="نص رأي العميل زي ما قاله بالظبط" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink dark:text-white">التقييم:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`} aria-label={`${n} نجوم`}>
              ★
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={save} className="rounded-full bg-primary px-6 py-3 font-bold text-white">
            {editingId ? "حفظ التعديلات" : "إضافة الرأي"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-6 py-3 font-bold dark:border-white/15">إلغاء التعديل</button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-amber-400">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">تعديل</button>
                <button type="button" disabled={busy === item.id} onClick={() => remove(item.id)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">حذف</button>
              </div>
            </div>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">“{item.text}”</p>
            <p className="mt-3 font-bold text-ink dark:text-white">{item.name}{item.role ? <span className="block text-sm font-normal text-slate-400">{item.role}</span> : null}</p>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">مفيش آراء لسه — القسم مش هيظهر على الموقع لحد ما تضيف رأي حقيقي.</p>}
      </div>
    </div>
  );
}
