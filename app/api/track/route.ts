import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { trackSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** تتبع الطلب: لازم رقم الطلب + رقم الموبايل يطابقوا — ومش بنعرض أي بيانات حساسة */
export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "خدمة التتبع مش متاحة حالياً — المتجر لسه مش متصل بقاعدة البيانات" }, { status: 503 });
  }

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
    .select("order_number, product_name, package_name, status, total, created_at, products(delivery_type)")
    .eq("order_number", order_number.trim().toUpperCase())
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: "مفيش طلب بالرقم ده — اتأكد من الرقم وحاول تاني" }, { status: 404 });
  }

  // التحقق من رقم الموبايل (بمقارنة آخر 10 أرقام عشان اختلاف صيغة الكتابة)
  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  const { data: full } = await admin
    .from("orders")
    .select("phone")
    .eq("order_number", order_number.trim().toUpperCase())
    .maybeSingle();
  if (!full || digits(String(full.phone)) !== digits(phone)) {
    return NextResponse.json({ error: "رقم الموبايل مش مطابق لرقم الطلب ده" }, { status: 403 });
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
