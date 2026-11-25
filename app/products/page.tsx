import type { Metadata } from "next";
import { fetchCategories, fetchProducts } from "@/lib/data";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفح كل منتجات Pixo: أنظمة ومواقع جاهزة، باقات تسويق، تصميم وموشن جرافيك، قوالب للتحميل، واشتراكات شهرية.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  const initialCategory = params.category ?? "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">كل المنتجات</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        حلول ديجيتال جاهزة وخدمات بأسعار ثابتة — اختار اللي يناسب بيزنسك واطلب في دقايق.
      </p>
      <div className="mt-8">
        <ShopClient products={products} categories={categories} initialCategory={initialCategory} />
      </div>
    </div>
  );
}
