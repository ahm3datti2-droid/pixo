"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import type { Category } from "@/lib/types";
import ProductForm, { toFormValue, type ProductFormValue } from "@/components/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormValue | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const [prodRes, catRes] = await Promise.all([
        adminFetch(`/api/admin/products/${params.id}`),
        adminFetch("/api/admin/categories"),
      ]);
      if (!prodRes.ok) {
        const data = await prodRes.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "المنتج غير موجود");
      } else {
        const data = await prodRes.json();
        setInitial(toFormValue(data.product));
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories((data.categories ?? []) as Category[]);
      }
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (error || !initial) {
    return <p className="rounded-2xl bg-rose-50 p-4 text-center font-semibold text-rose-600 dark:bg-rose-500/10">{error || "المنتج غير موجود"}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink dark:text-white">تعديل: {initial.name}</h1>
      <ProductForm initial={initial} categories={categories} />
    </div>
  );
}
