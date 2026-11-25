import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

/**
 * عميل Supabase العام (للقراءة من المتصفح والسيرفر).
 * بيرجع null لو مفاتيح Supabase مش مضبوطة، عشان الموقع يشتغل بالبيانات
 * الافتراضية من lib/data.ts من غير ما يقع وقت البناء أو التشغيل.
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** عميل المتصفح للمصادقة (تسجيل دخول الأدمن) — null لو مفيش إعدادات */
export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
