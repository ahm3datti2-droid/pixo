import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const orderSchema = z.object({
  product_slug: z.string().min(1, "المنتج مطلوب"),
  package_id: z.string().optional().nullable(),
  customer_name: z.string().min(3, "الاسم قصير جداً").max(100),
  phone: z.string().min(11, "رقم الموبايل غير صحيح").max(15),
  whatsapp: z.string().min(11, "رقم الواتساب غير صحيح").max(15),
  email: z.string().email("الإيميل غير صحيح").optional().or(z.literal("")),
  business_name: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  payment_method: z.enum(["instapay", "vodafone_cash"]),
  coupon_code: z.string().max(50).optional().or(z.literal("")),
  website: z.string().optional(), // honeypot — لازم يفضل فاضي
});

export const contactSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً").max(100),
  phone: z.string().max(15).optional().or(z.literal("")),
  email: z.string().email("الإيميل غير صحيح").optional().or(z.literal("")),
  message: z.string().min(10, "الرسالة قصيرة جداً").max(2000),
  website: z.string().optional(), // honeypot
});

export const trackSchema = z.object({
  order_number: z.string().min(3).max(20),
  phone: z.string().min(11).max(15),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(50),
  amount: z.number().positive(),
});

export interface CouponCheck {
  valid: boolean;
  discount: number;
  total: number;
  code?: string;
  error?: string;
}

/** التحقق من الكوبون وحساب الخصم — على السيرفر بس */
export async function checkCoupon(
  admin: SupabaseClient,
  code: string,
  amount: number
): Promise<CouponCheck> {
  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return { valid: false, discount: 0, total: amount, error: "الكوبون غير صالح أو منتهي" };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, discount: 0, total: amount, error: "الكوبون ده انتهت صلاحيته" };
  }
  if (data.max_uses != null && Number(data.uses_count ?? 0) >= Number(data.max_uses)) {
    return { valid: false, discount: 0, total: amount, error: "الكوبون ده وصل للحد الأقصى من الاستخدام" };
  }
  const discount =
    data.discount_type === "percent"
      ? Math.round((amount * Number(data.discount_value)) / 100)
      : Math.min(Number(data.discount_value), amount);
  return { valid: true, discount, total: Math.max(0, amount - discount), code: String(data.code) };
}
