import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const { data, error } = await guard.admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  let receipt_signed_url: string | null = null;
  if (data.receipt_url) {
    const { data: signed } = await guard.admin.storage.from("receipts").createSignedUrl(data.receipt_url, 60 * 60);
    receipt_signed_url = signed?.signedUrl ?? null;
  }
  // صور المنتجات — روابط موقّعة (ساعة) لنفس الباكت الخاص
  let product_photos_signed_urls: string[] = [];
  const photoPaths = Array.isArray(data.product_photos) ? (data.product_photos as string[]) : [];
  if (photoPaths.length > 0) {
    const signed = await Promise.all(
      photoPaths.map(async (p) => {
        const { data: s } = await guard.admin.storage.from("receipts").createSignedUrl(p, 60 * 60);
        return s?.signedUrl ?? null;
      })
    );
    product_photos_signed_urls = signed.filter((u): u is string => Boolean(u));
  }
  return NextResponse.json({ order: { ...data, receipt_signed_url, product_photos_signed_urls } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const payload: Record<string, unknown> = {};
  const validStatuses = ["pending", "paid", "in_progress", "delivered", "cancelled"];
  if (typeof body.status === "string" && validStatuses.includes(body.status)) payload.status = body.status;
  if (typeof body.admin_notes === "string") payload.admin_notes = body.admin_notes;

  const { error } = await guard.admin.from("orders").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حفظ التعديلات" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const { data: order } = await guard.admin.from("orders").select("id, receipt_url, product_photos").eq("id", id).maybeSingle();
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  const toRemove: string[] = [];
  if (order.receipt_url) toRemove.push(order.receipt_url as string);
  if (Array.isArray(order.product_photos)) toRemove.push(...(order.product_photos as string[]));
  if (toRemove.length > 0) {
    await guard.admin.storage.from("receipts").remove(toRemove);
  }
  const { error } = await guard.admin.from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حذف الطلب" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
