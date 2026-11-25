import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";
import { saveRelations } from "@/lib/product-relations";

export const dynamic = "force-dynamic";

const PRODUCT_SELECT = "*, product_images(*), packages(*), categories(name)";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const { data, error } = await guard.admin.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const payload: Record<string, unknown> = {};
  const fields = [
    "name", "slug", "category_id", "delivery_type", "short_description", "description",
    "features", "price", "old_price", "demo_url", "delivery_time",
    "download_file_path", "is_active", "is_featured", "sort_order",
  ];
  for (const f of fields) if (f in body) payload[f] = body[f];
  if (payload.old_price === "") payload.old_price = null;
  if (payload.demo_url === "") payload.demo_url = null;
  if (payload.delivery_time === "") payload.delivery_time = null;
  if (payload.download_file_path === "") payload.download_file_path = null;

  const { error } = await guard.admin.from("products").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حفظ التعديلات" }, { status: 500 });

  if ("images" in body || "packages" in body) {
    await guard.admin.from("product_images").delete().eq("product_id", id);
    await guard.admin.from("packages").delete().eq("product_id", id);
    await saveRelations(guard.admin, id, body);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await guard.admin.from("product_images").delete().eq("product_id", id);
  await guard.admin.from("packages").delete().eq("product_id", id);
  const { error } = await guard.admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حذف المنتج" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
