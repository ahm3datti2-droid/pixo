import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * رفع ملف من لوحة الأدمن:
 * - bucket=public-images → بيرجع رابط عام (صور المنتجات والأعمال)
 * - bucket=downloads → بيرجع مسار الملف الخاص (ملف التحميل للمنتج)
 * الحد الأقصى: 10 ميجا للصور، 50 ميجا للملفات القابلة للتحميل.
 */
export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const file = form.get("file");
  const bucket = String(form.get("bucket") ?? "public-images");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "اختار ملف الأول" }, { status: 400 });
  }
  if (!["public-images", "downloads"].includes(bucket)) {
    return NextResponse.json({ error: "الباكت غير صحيح" }, { status: 400 });
  }
  const maxSize = bucket === "downloads" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `الملف أكبر من الحد المسموح (${bucket === "downloads" ? "50" : "10"} ميجا)` }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await guard.admin.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: "تعذر رفع الملف — اتأكد إن الباكت موجود في Supabase" }, { status: 500 });
  }

  if (bucket === "public-images") {
    const { data } = guard.admin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl, path });
  }
  return NextResponse.json({ ok: true, path });
}
