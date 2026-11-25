import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import CheckoutForm from "@/components/CheckoutForm";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل بياناتك وادفع بإنستاباي أو فودافون كاش لاستلام طلبك من Pixo.",
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await fetchProductBySlug(decodeURIComponent(slug));
  if (!product) notFound();
  const settings = await getSettings();
  const initialPackageId = sp.package ?? null;
  const validPackage = product.packages.some((p) => p.id === initialPackageId) ? initialPackageId : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">إتمام الطلب</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        بتطلب: <span className="font-bold text-ink dark:text-white">{product.name}</span> —{" "}
        <span className="font-bold text-primary dark:text-accent">{formatPrice(product.price)}</span>
      </p>
      <div className="mt-8">
        <CheckoutForm product={product} settings={settings} initialPackageId={validPackage} />
      </div>
    </div>
  );
}
