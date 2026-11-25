import { NextResponse } from "next/server";
import { adminGuard, readJson } from "@/lib/admin-api";
import { saveRelations } from "@/lib/product-relations";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PRODUCT_SELECT = "*, product_images(*), packages(*), categories(name)";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin
    .from("products")
    .select(PRODUCT_SELECT)
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: "تعذر جلب المنتجات" }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  // نسخ منتج موجود
  if (body.duplicate_id) {
    const { data: src, error: srcError } = await guard.admin
      .from("products")
      .select("*, product_images(*), packages(*)")
      .eq("id", String(body.duplicate_id))
      .maybeSingle();
    if (srcError || !src) return NextResponse.json({ error: "المنتج الأصلي غير موجود" }, { status: 404 });
    const copy = { ...src };
    delete copy.id;
    delete copy.created_at;
    delete copy.product_images;
    delete copy.packages;
    copy.name = `${src.name} (نسخة)`;
    copy.slug = `${src.slug}-copy-${Date.now().toString(36)}`;
    copy.is_active = false;
    const { data: created, error } = await guard.admin.from("products").insert(copy).select("id").single();
    if (error || !created) return NextResponse.json({ error: "تعذر نسخ المنتج" }, { status: 500 });
    const newId = created.id as string;
    const images = (src.product_images as Array<{ url: string; sort_order: number }> | null) ?? [];
    if (images.length > 0) {
      await guard.admin.from("product_images").insert(images.map((im, i) => ({ product_id: newId, url: im.url, sort_order: i })));
    }
    const pkgs = (src.packages as Array<{ name: string; price: number; features: string[]; sort_order: number }> | null) ?? [];
    if (pkgs.length > 0) {
      await guard.admin.from("packages").insert(pkgs.map((p, i) => ({ product_id: newId, name: p.name, price: p.price, features: p.features ?? [], sort_order: i })));
    }
    return NextResponse.json({ ok: true, id: newId });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "السعر غير صحيح" }, { status: 400 });

  const slug = String(body.slug ?? "").trim() || slugify(name);
  const payload = {
    name,
    slug,
    category_id: body.category_id ? String(body.category_id) : null,
    delivery_type: String(body.delivery_type ?? "service"),
    short_description: String(body.short_description ?? ""),
    description: String(body.description ?? ""),
    features: Array.isArray(body.features) ? body.features : [],
    price,
    old_price: body.old_price != null && body.old_price !== "" ? Number(body.old_price) : null,
    demo_url: body.demo_url ? String(body.demo_url) : null,
    delivery_time: body.delivery_time ? String(body.delivery_time) : null,
    download_file_path: body.download_file_path ? String(body.download_file_path) : null,
    is_active: body.is_active !== false,
    is_featured: body.is_featured === true,
    sort_order: Number(body.sort_order ?? 0),
  };

  const { data: created, error } = await guard.admin.from("products").insert(payload).select("id").single();
  if (error || !created) {
    return NextResponse.json({ error: error?.message?.includes("duplicate") ? "السلاج ده مستخدم قبل كده — غيّره" : "تعذر إنشاء المنتج" }, { status: 500 });
  }
  const newId = created.id as string;
  await saveRelations(guard.admin, newId, body);
  return NextResponse.json({ ok: true, id: newId });
}
