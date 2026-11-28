import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { checkCoupon, couponValidateSchema } from "@/lib/validation";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "خدمة الكوبونات مش متاحة حالياً" }, { status: 503 });
  }

  // حدّ معدل ضد تخمين الأكواد (M-2): 5 محاولات في الدقيقة لنفس الـ IP
  const limited = rateLimitResponse(req, "coupon", 5);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "اكتب كود الكوبون" }, { status: 400 });
  }

  const result = await checkCoupon(admin, parsed.data.code, parsed.data.amount);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error ?? "الكوبون غير صالح" }, { status: 400 });
  }
  return NextResponse.json({ valid: true, code: result.code, discount: result.discount, total: result.total });
}
