import type { Product } from "@/lib/types";
import { DELIVERY_TYPE_LABELS } from "@/lib/utils";

/** ألوان متدرجة ثابتة حسب اسم المنتج — بديل للصورة لما مفيش صورة مرفوعة */
const GRADIENTS = [
  "from-violet-600 via-[#6C4DFF] to-cyan-400",
  "from-[#6C4DFF] to-[#00D1FF]",
  "from-indigo-600 to-cyan-400",
  "from-fuchsia-600 via-violet-600 to-cyan-400",
  "from-violet-700 to-sky-400",
];

function gradientFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function ProductVisual({
  product,
  className = "",
  big = false,
}: {
  product: Product;
  className?: string;
  big?: boolean;
}) {
  const firstImage = product.images?.[0]?.url;
  if (firstImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={firstImage} alt={product.name} className={`object-cover ${className}`} loading="lazy" />;
  }
  const initial = product.name.trim().charAt(0);
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradientFor(product.name)} ${className}`}
      aria-label={product.name}
    >
      <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      <span className={`relative font-extrabold text-white drop-shadow ${big ? "text-8xl" : "text-6xl"}`}>{initial}</span>
      <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        {DELIVERY_TYPE_LABELS[product.delivery_type]}
      </span>
    </div>
  );
}
