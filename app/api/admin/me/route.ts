import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/** التحقق من جلسة الأدمن: بيرجع الإيميل لو هو في ADMIN_EMAILS */
export async function GET(req: Request) {
  const result = await requireAdmin(req);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, email: result.email });
}
