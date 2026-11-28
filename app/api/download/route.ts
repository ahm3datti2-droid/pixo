import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * رابط تحميل آمن: بيتحقق من رقم الطلب + الموبايل + الحالة، وبيرجع Signed URL صالح 24 ساعة.
 * رسالة الخطأ موحّدة للطلب غير الموجود والموبايل الغلط (M-2 + L-2) —
 * الفرق بين 404 و403 كان بيسرّب وجود الطلب نفسه.
 */
const NOT_FOUND = "الطلب غير موجود أو بياناته مش مطابقة — اتأكد من رقم الطلب والموبايل";

export async function GET(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "خدمة التحميل مش متاحة حالياً" }, { status: 503 });
  }

  // حدّ معدل: 10 محاولات في الدقيقة لنفس الـ IP
  const limited = rateLimitResponse(req, "download", 10);
  if (limited) return limited;

  const url = new URL(req.url);
  const orderNumber = (url.searchParams.get("order") || "").trim().toUpperCase();
  const phone = (url.searchParams.get("phone") || "").trim();
  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "رقم الطلب ورقم الموبايل مطلوبين" }, { status: 400 });
  }

  const { data: order, error } = await admin
    .from("orders")
    .select("*, products(delivery_type)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  if (digits(String(order.phone)) !== digits(phone)) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }
  if (order.status !== "paid" && order.status !== "delivered") {
    return NextResponse.json({ error: "الملف هيكون متاح للتحميل بعد تأكيد الدفع" }, { status: 403 });
  }
  const deliveryType = (order as { products?: { delivery_type?: string } | null }).products?.delivery_type;
  if (deliveryType !== "instant_download") {
    return NextResponse.json({ error: "المنتج ده مش ملف للتحميل" }, { status: 400 });
  }

  const { data: product } = await admin.from("products").select("download_file_path").eq("id", order.product_id).maybeSingle();
  const filePath = (product as { download_file_path?: string | null } | null)?.download_file_path;
  if (!filePath) {
    return NextResponse.json(
      { error: "الملف هيتبعت لك على واتساب — تواصل معانا لو اتأخر" },
      { status: 404 }
    );
  }

  const { data: signed, error: signError } = await admin.storage
    .from("downloads")
    .createSignedUrl(filePath, 60 * 60 * 24); // 24 ساعة
  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "تعذر تجهيز رابط التحميل — حاول تاني" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
