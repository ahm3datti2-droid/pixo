import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin.from("portfolio").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: "تعذر جلب الأعمال" }, { status: 500 });
  return NextResponse.json({ portfolio: data });
}

export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "عنوان العمل مطلوب" }, { status: 400 });
  const { data, error } = await guard.admin
    .from("portfolio")
    .insert({
      title,
      image_url: String(body?.image_url ?? ""),
      link: body?.link ? String(body.link) : null,
      category: body?.category ? String(body.category) : null,
      sort_order: Number(body?.sort_order ?? 99),
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "تعذر إضافة العمل" }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}
