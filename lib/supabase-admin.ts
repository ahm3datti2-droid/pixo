import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * عميل Service Role — للسيرفر بس. ممنوع يظهر في المتصفح أبداً.
 * بيرجع null لو المفتاح مش مضبوط.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * التحقق من صلاحية الأدمن من التوكن اللي جاي في Authorization header.
 * بيرجع { user } لو الإيميل في ADMIN_EMAILS، غير كده { error }.
 */
export async function requireAdmin(req: Request): Promise<{ email: string } | { error: string; status: number }> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { error: "غير مصرّح — سجّل الدخول الأول", status: 401 };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { error: "Supabase غير مفعّل على السيرفر", status: 503 };

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return { error: "جلسة غير صالحة — سجّل الدخول من جديد", status: 401 };
  if (!isAdminEmail(data.user.email)) return { error: "الإيميل ده مش أدمن", status: 403 };
  return { email: data.user.email };
}
