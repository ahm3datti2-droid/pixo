"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase";
import { adminFetch } from "@/lib/admin-client";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = getBrowserClient();
    if (!supabase) {
      setError("Supabase مش مضبوط — ضيف مفاتيح Supabase في ملف .env.local (شوف README)");
      return;
    }
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError("الإيميل أو كلمة السر غلط — حاول تاني");
        return;
      }
      const res = await adminFetch("/api/admin/me");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        await supabase.auth.signOut();
        setError((data as { error?: string }).error ?? "الإيميل ده مش أدمن");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("تعذر الاتصال بالسيرفر — حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex justify-center">
          <Logo className="h-10 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold text-ink dark:text-white">دخول لوحة الأدمن</h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          سجّل دخولك بالإيميل وكلمة السر اللي عملتهم في Supabase
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">الإيميل</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@pixo.com" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-bold text-ink dark:text-white">كلمة السر</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-primary py-3.5 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60">
            {loading ? "جاري تسجيل الدخول…" : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
