import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  const payload: Record<string, unknown> = {};
  if ("name" in body) payload.name = String(body.name).trim();
  if ("sort_order" in body) payload.sort_order = Number(body.sort_order);
  const { error } = await guard.admin.from("categories").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حفظ التعديلات" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const { count } = await guard.admin.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "مش هينفع تمسح التصنيف ده — فيه منتجات مربوطة بيه. انقل المنتجات لتصنيف تاني الأول" }, { status: 400 });
  }
  const { error } = await guard.admin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حذف التصنيف" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
