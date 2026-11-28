import type { SupabaseClient } from "@supabase/supabase-js";
import { orderNumberFrom } from "./utils";

/**
 * توليد رقم الطلب التالي: PX-10023، PX-10024…
 * ذرّي عبر sequence في قاعدة البيانات (M-4) — طلبان متزامنان مش هياخدوا
 * نفس الرقم أبداً (النسخة القديمة كانت بتقرأ آخر رقم وتزود 1، فكان ممكن
 * يتكرر ويفشل الإدخال بقيد UNIQUE).
 */
export async function nextOrderNumber(admin: SupabaseClient): Promise<string> {
  try {
    const { data, error } = await admin.rpc("next_order_number");
    if (!error && typeof data === "number" && Number.isFinite(data)) {
      return orderNumberFrom(data);
    }
  } catch {
    // fall through للمنطق الاحتياطي تحت
  }

  // احتياطي لو دالة الـ sequence لسه مش موجودة (بيئة قديمة):
  // نفس المنطق القديم — صحيح بس مش آمن ضد التزامن.
  try {
    const { data } = await admin
      .from("orders")
      .select("order_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const last = data?.order_number ? parseInt(String(data.order_number).replace(/\D/g, ""), 10) : NaN;
    const next = Number.isFinite(last) && last >= 10023 ? last + 1 : 10023;
    return orderNumberFrom(next);
  } catch {
    return orderNumberFrom(10023);
  }
}
