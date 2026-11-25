import type { DeliveryType, OrderStatus } from "./types";

/** تنسيق السعر بالجنيه المصري */
export function formatPrice(n: number): string {
  return `${new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n)} ج.م`;
}

/** سلاج يدعم العربي: بيحافظ على الحروف العربية والأرقام، والمسافات تبقى - */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** توحيد رقم الموبايل المصري لصيغة دولية بدون + */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  if (digits.length === 10) return `20${digits}`;
  return digits;
}

export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${normalizePhone(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function orderNumberFrom(n: number): string {
  return `PX-${n}`;
}

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  instant_download: "تحميل فوري",
  service: "خدمة منفذة لك",
  subscription: "اشتراك شهري",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  paid: "تم تأكيد الدفع",
  in_progress: "جاري التنفيذ",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = ["pending", "paid", "in_progress", "delivered"];

export function isValidEgyptianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("20") ? digits.slice(2) : digits;
  return /^01[0-9]{9}$/.test(local);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
