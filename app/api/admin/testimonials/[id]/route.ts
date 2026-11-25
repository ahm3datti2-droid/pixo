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
  for (const f of ["name", "role", "text", "rating"]) {
    if (f in body) payload[f] = body[f];
  }
  const { error } = await guard.admin.from("testimonials").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حفظ التعديلات" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const { error } = await guard.admin.from("testimonials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حذف الرأي" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
