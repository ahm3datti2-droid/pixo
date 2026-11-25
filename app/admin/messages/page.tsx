"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { SiteMessage } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<SiteMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/messages");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر جلب الرسائل");
    } else {
      const data = await res.json();
      setMessages((data.messages ?? []) as SiteMessage[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string, isRead: boolean) {
    setBusy(id);
    await adminFetch(`/api/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify({ is_read: isRead }) });
    await load();
    setBusy("");
  }

  async function remove(id: string) {
    if (!confirm("متأكد إنك عايز تمسح الرسالة دي؟")) return;
    setBusy(id);
    await adminFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
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

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">
        الرسائل ({messages.length}){unread > 0 ? ` — ${unread} غير مقروءة` : ""}
      </h1>
      {error && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{error}</p>}
      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-3xl border p-5 shadow-sm ${m.is_read ? "border-slate-100 bg-white dark:border-white/10 dark:bg-white/5" : "border-primary/40 bg-primary-light/40 dark:bg-primary/10"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-ink dark:text-white">
                {m.name}
                {m.phone ? <span className="font-normal text-slate-400" dir="ltr"> — {m.phone}</span> : ""}
                {m.email ? <span className="block text-sm font-normal text-slate-400" dir="ltr">{m.email}</span> : null}
              </span>
              <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString("ar-EG")}</span>
            </div>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.phone && (
                <a
                  href={whatsappLink(m.phone, `أهلاً ${m.name}، شكراً لرسالتك لـ Pixo — `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
                >
                  رد واتساب
                </a>
              )}
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => markRead(m.id, !m.is_read)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300"
              >
                {m.is_read ? "تعليم كغير مقروءة" : "تعليم كمقروءة"}
              </button>
              <button type="button" disabled={busy === m.id} onClick={() => remove(m.id)} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">
                حذف
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">مفيش رسائل لسه.</p>}
      </div>
    </div>
  );
}
