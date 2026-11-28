import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { trackSchema } from "@/lib/validation";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * تتبع الطلب: لازم رقم الطلب + رقم الموبايل يطابقوا — ومش بنعرض أي بيانات حساسة.
 * رسالة الخطأ موحّدة للرقم غير الموجود والموبايل الغلط (M-2 + L-2):
 * الفرق بين 404 و403 كان بيسرّب وجود الطلب نفسه (oracle) مع الأرقام المتسلسلة.
 */
const NOT_FOUND = "مفيش طلب بالبيانات دي — اتأكد من رقم الطلب والموبايل وحاول تاني";

export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "خدمة التتبع مش متاحة حالياً — المتجر لسه مش متصل بقاعدة البيانات" }, { status: 503 });
  }

  // حدّ معدل: 5 محاولات في الدقيقة لنفس الـ IP
  const limited = rateLimitResponse(req, "track", 5);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اكتب رقم الطلب ورقم الموبايل بشكل صحيح" }, { status: 400 });
  }
  const { order_number, phone } = parsed.data;

  const { data: order, error } = await admin
    .from("orders")
    .select("order_number, product_name, package_name, status, total, created_at, phone, products(delivery_type)")
    .eq("order_number", order_number.trim().toUpperCase())
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  // التحقق من رقم الموبايل (بمقارنة آخر 10 أرقام عشان اختلاف صيغة الكتابة)
  // نفس الرسالة والكود بتوع «غير موجود» — عشان وجود الطلب نفسه ميتسرّبش.
  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  if (digits(String(order.phone)) !== digits(phone)) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const deliveryType = (order as { products?: { delivery_type?: string } | null }).products?.delivery_type ?? "";
  const downloadable = deliveryType === "instant_download" && (order.status === "paid" || order.status === "delivered");

  return NextResponse.json({
    order_number: order.order_number,
    product_name: order.product_name,
    package_name: order.package_name,
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    delivery_type: deliveryType,
    download_available: downloadable,
  });
}
