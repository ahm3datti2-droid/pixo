import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminContext {
  admin: SupabaseClient;
  email: string;
}

/**
 * تحقق مشترك لكل روابط الأدمن: لازم توكن صالح + إيميل في ADMIN_EMAILS،
 * ولازم Service Role Key يكون مضبوط. بيرجع الـ context أو Response بالخطأ.
 */
export async function adminGuard(req: Request): Promise<AdminContext | NextResponse> {
  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase غير مفعّل على السيرفر — كمّل الإعداد من README" }, { status: 503 });
  }
  return { admin, email: auth.email };
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
