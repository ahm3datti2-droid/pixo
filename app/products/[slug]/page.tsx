import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts } from "@/lib/data";
import ProductDetails from "@/components/ProductDetails";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(decodeURIComponent(slug));
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | Pixo`,
      description: product.short_description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(decodeURIComponent(slug));
  if (!product) notFound();

  const all = await fetchProducts();
  const related = all
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.category_name === product.category_name))
    .slice(0, 3);

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pixo.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    url: `${base}/products/${encodeURIComponent(product.slug)}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetails product={product} related={related} />
    </div>
  );
}
