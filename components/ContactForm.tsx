"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("اكتب اسمك");
    if (message.trim().length < 10) return setError("اكتب رسالتك (10 حروف على الأقل)");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("الإيميل غير صحيح");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim(), website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "حصلت مشكلة — حاول تاني");
      setSent(true);
    } catch {
      setError("تعذر الاتصال بالسيرفر — حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">✓</div>
        <h2 className="mt-4 text-xl font-extrabold text-ink dark:text-white">وصلت رسالتك!</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-300">هنرد عليك في أقرب وقت على رقمك أو إيميلك.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">الاسم *</label>
          <input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="اسمك بالكامل" />
        </div>
        <div>
          <label htmlFor="ct-phone" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">رقم الموبايل</label>
          <input id="ct-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" dir="ltr" style={{ textAlign: "right" }} />
        </div>
      </div>
      <div>
        <label htmlFor="ct-email" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">الإيميل</label>
        <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="name@email.com" dir="ltr" style={{ textAlign: "right" }} />
      </div>
      <div>
        <label htmlFor="ct-msg" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">رسالتك *</label>
        <textarea id="ct-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={inputCls} placeholder="اكتب استفسارك أو فكرة مشروعك…" />
      </div>
      {/* Honeypot — حقل مخفي ضد السبام */}
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-full bg-primary py-3.5 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60">
        {loading ? "جاري الإرسال…" : "ابعت رسالتك"}
      </button>
    </form>
  );
}
