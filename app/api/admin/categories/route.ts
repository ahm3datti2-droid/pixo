import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: "تعذر جلب التصنيفات" }, { status: 500 });
  return NextResponse.json({ categories: data });
}

export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });
  const { data, error } = await guard.admin
    .from("categories")
    .insert({ name, slug: slugify(name), sort_order: Number(body?.sort_order ?? 99) })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "تعذر إضافة التصنيف" }, { status: 500 });
  return NextResponse.json({ ok: true, category: data });
}
