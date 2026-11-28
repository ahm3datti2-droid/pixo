import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminClient } from "@/lib/supabase-admin";
import { rateLimitResponse } from "@/lib/rate-limit";
import { IMAGE_KINDS } from "@/lib/file-validation";

export const dynamic = "force-dynamic";

/**
 * إصدار رابط رفع موقّع لصورة منتج واحدة (خدمة صور المنتجات).
 * المتصفح بيرفع الصورة مباشرة لـ Supabase Storage بالرابط ده — من غير ما
 * الصورة تعدّي على سيرفر Vercel (حد جسم الطلب 4.5 ميجا كان هيمنع رفع
 * صور متعددة مع فورم الطلب). الملفات بتتخزن في باكت receipts الخاص
 * (نفس مكان الإيصالات — باكت خاص، مش عام)، والمسار بيتسجل في الطلب
 * بس لو طابق الشكل ده بالظبط.
 *
 * حدّ المعدل: 60 طلب في الدقيقة لنفس الـ IP (رفع 30 صورة = 30 طلب).
 * التحقق من محتوى الصورة نفسه (magic bytes) بيحصل في المتصفح قبل طلب
 * الرابط، والملفات في باكت خاص فمش بتتعرض للعامة أبداً.
 */
export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "رفع الصور غير متاح حالياً" }, { status: 503 });
  }

  const limited = rateLimitResponse(req, "upload-url", 60);
  if (limited) return limited;

  let body: { fileName?: unknown; contentType?: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const fileName = String(body?.fileName ?? "");
  const contentType = String(body?.contentType ?? "");
  const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
  const kind = IMAGE_KINDS.find((k) => k.ext === ext);
  if (!kind) {
    return NextResponse.json(
      { error: `نوع الملف مش مسموح — المسموح: ${IMAGE_KINDS.map((k) => k.ext).join("، ")}` },
      { status: 400 }
    );
  }
  if (contentType && contentType !== kind.mime) {
    return NextResponse.json({ error: "نوع الملف مش مطابق للامتداد بتاعه" }, { status: 400 });
  }

  const path = `product-photos/${randomUUID()}/${Date.now()}-${randomUUID().slice(0, 8)}.${kind.ext}`;
  const { data, error } = await admin.storage.from("receipts").createSignedUploadUrl(path);
  if (error || !data?.signedUrl || !data?.token) {
    return NextResponse.json({ error: "تعذر تجهيز رفع الصورة — حاول تاني" }, { status: 500 });
  }
  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path });
}
