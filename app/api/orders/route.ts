import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { checkCoupon, orderSchema } from "@/lib/validation";
import { nextOrderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * إنشاء طلب جديد.
 * السعر والكوبون بيتحسبوا على السيرفر من قاعدة البيانات — السعر اللي جاي من المتصفح مش بيتاخد بيه أبداً.
 */
export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "المتجر لسه مش متصل بقاعدة البيانات — كمّل إعداد Supabase من README وبعدين جرّب تاني" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "بيانات الطلب مش صحيحة" }, { status: 400 });
  }

  const raw = {
    product_slug: form.get("product_slug"),
    package_id: form.get("package_id"),
    customer_name: form.get("customer_name"),
    phone: form.get("phone"),
    whatsapp: form.get("whatsapp"),
    email: form.get("email"),
    business_name: form.get("business_name"),
    notes: form.get("notes"),
    payment_method: form.get("payment_method"),
    coupon_code: form.get("coupon_code"),
    website: form.get("website"),
  };

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const msg = first?.message ?? "";
    // رسائل zod الافتراضية إنجليزي ومش مفهومة للعميل — بدّلها برسالة عربي واضحة
    const friendly =
      !msg || msg === "Invalid input" || msg.startsWith("Invalid input:") || msg.startsWith("Invalid option")
        ? "بيانات الطلب مش صحيحة — راجع البيانات وحاول تاني"
        : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot — لو الحقل المخفي اتملى يبقى سبام
  if (input.website && input.website.trim() !== "") {
    return NextResponse.json({ error: "تم رفض الطلب" }, { status: 400 });
  }

  // جلب المنتج والباقة من قاعدة البيانات (مصدر الحقيقة للسعر)
  const { data: product, error: productError } = await admin
    .from("products")
    .select("*, packages(*)")
    .eq("slug", input.product_slug)
    .eq("is_active", true)
    .maybeSingle();
  if (productError || !product) {
    return NextResponse.json({ error: "المنتج ده مش متاح حالياً" }, { status: 404 });
  }

  let packageName: string | null = null;
  let unitPrice = Number(product.price);
  if (input.package_id) {
    const pkg = (product.packages as Array<{ id: string; name: string; price: number }> | null)?.find(
      (p) => String(p.id) === input.package_id
    );
    if (!pkg) return NextResponse.json({ error: "الباقة المختارة غير صحيحة" }, { status: 400 });
    packageName = pkg.name;
    unitPrice = Number(pkg.price);
  }

  // الكوبون — تحقق وحساب على السيرفر
  let discount = 0;
  let couponCode: string | null = null;
  if (input.coupon_code) {
    const check = await checkCoupon(admin, input.coupon_code, unitPrice);
    if (!check.valid) return NextResponse.json({ error: check.error ?? "الكوبون غير صالح" }, { status: 400 });
    discount = check.discount;
    couponCode = check.code ?? input.coupon_code.toUpperCase();
  }
  const total = Math.max(0, unitPrice - discount);

  // رفع صورة الإيصال (اختياري) لباكت receipts الخاص
  let receiptUrl: string | null = null;
  const receipt = form.get("receipt");
  if (receipt instanceof File && receipt.size > 0) {
    if (receipt.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "صورة الإيصال أكبر من 5 ميجا" }, { status: 400 });
    }
    if (!receipt.type.startsWith("image/")) {
      return NextResponse.json({ error: "الإيصال لازم يكون صورة" }, { status: 400 });
    }
    const ext = receipt.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await admin.storage.from("receipts").upload(path, receipt, {
      contentType: receipt.type,
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: "تعذر رفع صورة الإيصال — حاول تاني" }, { status: 500 });
    }
    receiptUrl = path;
  }

  const orderNumber = await nextOrderNumber(admin);

  const { data: order, error: insertError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      product_id: product.id,
      product_name: product.name,
      package_id: input.package_id ?? null,
      package_name: packageName,
      customer_name: input.customer_name,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email || null,
      business_name: input.business_name || null,
      notes: input.notes || null,
      payment_method: input.payment_method,
      coupon_code: couponCode,
      subtotal: unitPrice,
      discount,
      total,
      receipt_url: receiptUrl,
      status: "pending",
    })
    .select("order_number, total, product_name")
    .single();

  if (insertError || !order) {
    return NextResponse.json({ error: "تعذر حفظ الطلب — حاول تاني" }, { status: 500 });
  }

  if (couponCode) {
    const { data: c } = await admin.from("coupons").select("id, uses_count").ilike("code", couponCode).maybeSingle();
    if (c) await admin.from("coupons").update({ uses_count: Number(c.uses_count ?? 0) + 1 }).eq("id", c.id);
  }

  return NextResponse.json({
    order_number: order.order_number,
    total: order.total,
    product_name: order.product_name,
  });
}
