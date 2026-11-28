import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-api";
import { validateUpload, IMAGE_KINDS, DOWNLOAD_KINDS } from "@/lib/file-validation";

export const dynamic = "force-dynamic";

/**
 * رفع ملف من لوحة الأدمن:
 * - bucket=public-images → بيرجع رابط عام (صور المنتجات والأعمال)
 * - bucket=downloads → بيرجع مسار الملف الخاص (ملف التحميل للمنتج)
 * الحد الأقصى: 10 ميجا للصور، 50 ميجا للملفات القابلة للتحميل.
 * قائمة سماح صارمة (M-3): امتداد + MIME + magic bytes — SVG وHTML وJS
 * مرفوضين تماماً، فمفيش ملف فيه سكربت يوصل للباكت العام.
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

  // التحقق من النوع والمحتوى الفعلي قبل الرفع
  const allowed = bucket === "public-images" ? IMAGE_KINDS : DOWNLOAD_KINDS;
  const checked = await validateUpload(file, allowed);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${checked.ext}`;
  const { error } = await guard.admin.storage.from(bucket).upload(path, file, {
    contentType: checked.mime,
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
