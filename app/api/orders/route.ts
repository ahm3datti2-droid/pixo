import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { checkCoupon, orderSchema } from "@/lib/validation";
import { nextOrderNumber } from "@/lib/orders";
import { rateLimitResponse } from "@/lib/rate-limit";
import { validateUpload, IMAGE_KINDS } from "@/lib/file-validation";

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

  // حدّ معدل ضد السبام (M-2): 10 طلبات في الدقيقة لنفس الـ IP
  const limited = rateLimitResponse(req, "orders", 10);
  if (limited) return limited;

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
    product_count: form.get("product_count"),
    style: form.get("style"),
    product_photo_paths: form.get("product_photo_paths"),
    extra_fields: form.get("extra_fields"),
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
  let couponId: string | null = null;
  if (input.coupon_code) {
    const check = await checkCoupon(admin, input.coupon_code, unitPrice);
    if (!check.valid) return NextResponse.json({ error: check.error ?? "الكوبون غير صالح" }, { status: 400 });
    discount = check.discount;
    couponCode = check.code ?? input.coupon_code.toUpperCase();
    couponId = check.couponId ?? null;
  }
  const total = Math.max(0, unitPrice - discount);

  // حقول إضافية للمنتج — بتتأكد على السيرفر من details بتاع المنتج نفسه،
  // مش من اللي المتصفح بعته. لو المنتج مش طالب الحقول دي، أي قيمة جاية
  // بتتجاهل — فالعميل مش هيقدر يفرض حقول على منتج تاني.
  const orderExtras = (
    product.details as {
      order?: {
        product_count?: boolean;
        styles?: string[];
        product_photos?: boolean;
        require_business_name?: boolean;
        fields?: { key: string; label: string; type?: "text" | "tel" | "url"; required?: boolean }[];
      };
    } | null
  )?.order;
  // اسم البيزنس إجباري لبعض المنتجات (زي باقة «بيزنسك أونلاين في 48 ساعة»)
  if (orderExtras?.require_business_name && !input.business_name?.trim()) {
    return NextResponse.json({ error: "من فضلك اكتب اسم البيزنس" }, { status: 400 });
  }
  // حقول الطلب العامة — بتتأكد من تعريف المنتج نفسه، وأي مفتاح مش معرّف بيتجاهل
  let extraFields: Record<string, string> = {};
  if (orderExtras?.fields?.length) {
    let parsedExtra: unknown = {};
    if (input.extra_fields) {
      try {
        parsedExtra = JSON.parse(input.extra_fields);
      } catch {
        return NextResponse.json({ error: "بيانات الطلب مش صحيحة — راجع البيانات وحاول تاني" }, { status: 400 });
      }
    }
    if (typeof parsedExtra !== "object" || parsedExtra === null || Array.isArray(parsedExtra)) {
      return NextResponse.json({ error: "بيانات الطلب مش صحيحة — راجع البيانات وحاول تاني" }, { status: 400 });
    }
    const extraObj = parsedExtra as Record<string, unknown>;
    for (const f of orderExtras.fields) {
      const v = typeof extraObj[f.key] === "string" ? (extraObj[f.key] as string).trim() : "";
      if (f.required && !v) {
        return NextResponse.json({ error: `من فضلك املأ حقل «${f.label}»` }, { status: 400 });
      }
      if (v) {
        if (v.length > 200) {
          return NextResponse.json({ error: `«${f.label}» طويل جداً` }, { status: 400 });
        }
        if (f.type === "tel" && !/^01[0-9]{9}$/.test(v.replace(/[^0-9]/g, ""))) {
          return NextResponse.json({ error: `«${f.label}» مش رقم مصري صحيح — لازم يبدأ بـ 01` }, { status: 400 });
        }
        extraFields[f.key] = v;
      }
    }
  }
  let productCount: number | null = null;
  if (orderExtras?.product_count) {
    const n = Number(input.product_count);
    if (!input.product_count || !Number.isInteger(n) || n < 1 || n > 1000) {
      return NextResponse.json({ error: "من فضلك اكتب عدد المنتجات (رقم من 1 لـ 1000)" }, { status: 400 });
    }
    productCount = n;
  }
  let style: string | null = null;
  if (orderExtras?.styles?.length) {
    if (!input.style || !orderExtras.styles.includes(input.style)) {
      return NextResponse.json({ error: "من فضلك اختار الستايل المطلوب" }, { status: 400 });
    }
    style = input.style;
  }
  let productPhotos: string[] = [];
  if (orderExtras?.product_photos && input.product_photo_paths) {
    let parsedPaths: unknown;
    try {
      parsedPaths = JSON.parse(input.product_photo_paths);
    } catch {
      return NextResponse.json({ error: "صور المنتجات غير صالحة — ارفعها تاني" }, { status: 400 });
    }
    // المسار لازم يكون بالشكل اللي روت upload-url بيصدره بالظبط —
    // أي مسار تاني (زي إيصال طلب تاني) بيترفض.
    const pathRe = /^product-photos\/[0-9a-f-]+\/[0-9]+-[0-9a-f]+\.(jpg|jpeg|png|webp|gif)$/i;
    if (
      !Array.isArray(parsedPaths) ||
      parsedPaths.length > 30 ||
      parsedPaths.some((p) => typeof p !== "string" || !pathRe.test(p))
    ) {
      return NextResponse.json({ error: "صور المنتجات غير صالحة — ارفعها تاني" }, { status: 400 });
    }
    productPhotos = parsedPaths as string[];
  }

  // رفع صورة الإيصال (اختياري) لباكت receipts الخاص
  // التحقق على السيرفر: امتداد + MIME + magic bytes (M-3) — مش بنثق في
  // file.type اللي المتصفح بيبعته، ولا في الامتداد اللي في اسم الملف.
  let receiptUrl: string | null = null;
  const receipt = form.get("receipt");
  if (receipt instanceof File && receipt.size > 0) {
    if (receipt.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "صورة الإيصال أكبر من 5 ميجا" }, { status: 400 });
    }
    const checked = await validateUpload(receipt, IMAGE_KINDS);
    if (!checked.ok) {
      return NextResponse.json({ error: checked.error }, { status: 400 });
    }
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${checked.ext}`;
    const { error: uploadError } = await admin.storage.from("receipts").upload(path, receipt, {
      contentType: checked.mime,
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
      product_count: productCount,
      style,
      product_photos: productPhotos,
      extra_fields: extraFields,
      payment_method: input.payment_method,
      coupon_code: couponCode,
      subtotal: unitPrice,
      discount,
      total,
      receipt_url: receiptUrl,
      status: "pending",
    })
    .select("id, order_number, total, product_name")
    .single();

  if (insertError || !order) {
    return NextResponse.json({ error: "تعذر حفظ الطلب — حاول تاني" }, { status: 500 });
  }

  // زيادة عدّاد الكوبون ذرّياً (M-4): دالة SQL واحدة بتزود uses_count
  // بشرط إنه لسه تحت الحد الأقصى — طلبان متزامنان مش هيتجاوزوا max_uses.
  // لو الزيادة فشلت (الكوبون خلص في نفس اللحظة بطلب تاني)، بنمسح الطلب
  // اللي اتعمل ونرجّع خطأ — أحسن من خصم اتطبّق من غير ما يتعدّ.
  if (couponCode && couponId) {
    const { data: applied, error: rpcError } = await admin.rpc("apply_coupon", { p_coupon_id: couponId });
    if (!rpcError) {
      if (applied !== true) {
        await admin.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { error: "الكوبون ده وصل للحد الأقصى من الاستخدام — جرّب من غير كوبون" },
          { status: 400 }
        );
      }
    } else {
      // احتياطي لو الدالة لسه مش موجودة (قبل تطبيق الـ migration):
      // نفس المنطق القديم — صحيح بس مش آمن ضد التزامن.
      const { data: c } = await admin.from("coupons").select("id, uses_count").ilike("code", couponCode).maybeSingle();
      if (c) await admin.from("coupons").update({ uses_count: Number(c.uses_count ?? 0) + 1 }).eq("id", c.id);
    }
  }

  return NextResponse.json({
    order_number: order.order_number,
    total: order.total,
    product_name: order.product_name,
  });
}
