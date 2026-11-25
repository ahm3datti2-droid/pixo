import type { SupabaseClient } from "@supabase/supabase-js";

/** حفظ صور وباقات المنتج (بتستبدل العلاقات الحالية عند التعديل) */
export async function saveRelations(
  admin: SupabaseClient,
  productId: string,
  body: Record<string, unknown>
): Promise<void> {
  const images = Array.isArray(body.images) ? (body.images as string[]).filter(Boolean) : [];
  if (images.length > 0) {
    await admin.from("product_images").insert(images.map((url, i) => ({ product_id: productId, url, sort_order: i })));
  }
  const pkgs = Array.isArray(body.packages) ? body.packages : [];
  if (pkgs.length > 0) {
    await admin.from("packages").insert(
      (pkgs as Array<Record<string, unknown>>).map((p, i) => ({
        product_id: productId,
        name: String(p.name ?? ""),
        price: Number(p.price ?? 0),
        features: Array.isArray(p.features) ? p.features : [],
        sort_order: i,
      }))
    );
  }
}
