import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data } = await guard.admin.from("settings").select("*").limit(1).maybeSingle();
  return NextResponse.json({ settings: data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS });
}

export async function PATCH(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const payload: Record<string, unknown> = {};
  const fields = [
    "store_name", "whatsapp_number", "instapay_address", "vodafone_cash_number",
    "facebook_url", "instagram_url", "tiktok_url", "hero_title", "hero_subtitle", "announcement_text",
  ];
  for (const f of fields) if (f in body) payload[f] = String(body[f] ?? "");

  const { data: existing } = await guard.admin.from("settings").select("id").limit(1).maybeSingle();
  if (existing) {
    const { error } = await guard.admin.from("settings").update(payload).eq("id", (existing as { id: string }).id);
    if (error) return NextResponse.json({ error: "تعذر حفظ الإعدادات" }, { status: 500 });
  } else {
    const { error } = await guard.admin.from("settings").insert(payload);
    if (error) return NextResponse.json({ error: "تعذر حفظ الإعدادات" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
