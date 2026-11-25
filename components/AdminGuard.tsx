"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase";
import { adminFetch, adminLogout } from "@/lib/admin-client";

/** حارس صفحات الأدمن: لو مفيش جلسة أو الإيميل مش أدمن → تحويل لصفحة الدخول */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = getBrowserClient();
      if (!supabase) {
        setError("Supabase مش مضبوط — ضيف مفاتيح Supabase في ملف .env.local على Vercel (شوف README)");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      const res = await adminFetch("/api/admin/me");
      if (!res.ok) {
        await adminLogout();
        router.replace("/admin/login");
        return;
      }
      setOk(true);
    })();
  }, [router]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="font-bold text-amber-700 dark:text-amber-300">المتجر محتاج إعداد أولاً</p>
        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{error}</p>
      </div>
    );
  }
  if (!ok) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-label="جاري التحقق…" />
      </div>
    );
  }
  return <>{children}</>;
}
