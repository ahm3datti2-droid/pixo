"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Category } from "@/lib/types";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await adminFetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories((data.categories ?? []) as Category[]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink dark:text-white">إضافة منتج جديد</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
