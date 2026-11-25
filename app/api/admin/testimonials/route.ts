import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin.from("testimonials").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "تعذر جلب الآراء" }, { status: 500 });
  return NextResponse.json({ testimonials: data });
}

export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  const name = String(body?.name ?? "").trim();
  const text = String(body?.text ?? "").trim();
  if (!name || !text) return NextResponse.json({ error: "اسم العميل ونص الرأي مطلوبين" }, { status: 400 });
  const { data, error } = await guard.admin
    .from("testimonials")
    .insert({
      name,
      role: body?.role ? String(body.role) : null,
      text,
      rating: Math.max(1, Math.min(5, Number(body?.rating ?? 5))),
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "تعذر إضافة الرأي" }, { status: 500 });
  return NextResponse.json({ ok: true, testimonial: data });
}
