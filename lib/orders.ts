import type { SupabaseClient } from "@supabase/supabase-js";
import { orderNumberFrom } from "./utils";

/** توليد رقم الطلب التالي: PX-10023، PX-10024… */
export async function nextOrderNumber(admin: SupabaseClient): Promise<string> {
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
