import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "تعذر جلب الكوبونات" }, { status: 500 });
  return NextResponse.json({ coupons: data });
}

export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "كود الكوبون مطلوب" }, { status: 400 });
  const { data, error } = await guard.admin
    .from("coupons")
    .insert({
      code,
      discount_type: body?.discount_type === "fixed" ? "fixed" : "percent",
      discount_value: Number(body?.discount_value ?? 0),
      expires_at: body?.expires_at ? String(body.expires_at) : null,
      max_uses: body?.max_uses ? Number(body.max_uses) : null,
      is_active: body?.is_active !== false,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "تعذر إضافة الكوبون — ممكن الكود يكون مستخدم قبل كده" }, { status: 500 });
  return NextResponse.json({ ok: true, coupon: data });
}
