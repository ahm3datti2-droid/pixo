export type DeliveryType = "instant_download" | "service" | "subscription";
export type OrderStatus = "pending" | "paid" | "in_progress" | "delivered" | "cancelled";
export type PaymentMethod = "instapay" | "vodafone_cash";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  icon?: string | null;
}

export interface Package {
  id: string;
  product_id: string;
  name: string;
  price: number;
  features: string[];
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

/**
 * محتوى إضافي اختياري لصفحة المنتج (JSONB في جدول products).
 * بيتعرض بس لو موجود — المنتجات القديمة من غيره بتشتغل زي ما هي.
 */
export interface ProductDetailsContent {
  /** خطوات «إزاي بتشتغل؟» */
  steps?: { title: string; items: string[] };
  /** صندوق نصايح «عشان تطلع أحسن نتيجة» */
  tips?: { title: string; items: string[] };
  /** أسئلة شائعة خاصة بالمنتج ده (بتتضاف للأسئلة العامة) */
  faq?: { q: string; a: string }[];
  /** «الباقة فيها إيه؟» — عناصر بعنوان ووصف (بتحل محل كارت «هتاخد إيه بالظبط؟») */
  included?: { title: string; items: { title: string; desc: string }[] };
  /** ملاحظة صغيرة تحت قسم «الباقة فيها إيه؟» */
  note?: string;
  /** رسالة مخصصة بتظهر في شاشة نجاح الطلب بدل/بعد النص العام */
  success_message?: string;
  /** حقول إضافية في فورم الطلب للمنتج ده */
  order?: {
    /** يظهر حقل «عدد المنتجات» (رقم إجباري) */
    product_count?: boolean;
    /** يظهر حقل «الستايل المطلوب» (قائمة الاختيارات دي) */
    styles?: string[];
    /** يظهر حقل رفع صور المنتجات (حتى 30 صورة) */
    product_photos?: boolean;
    /** يخلي حقل «اسم البيزنس» الأساسي إجباري للمنتج ده */
    require_business_name?: boolean;
    /** حقول نصية عامة (بتتخزن في orders.extra_fields) */
    fields?: { key: string; label: string; type?: "text" | "tel" | "url"; required?: boolean; placeholder?: string }[];
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category_name?: string | null;
  delivery_type: DeliveryType;
  short_description: string;
  description: string;
  features: string[];
  price: number;
  old_price: number | null;
  demo_url: string | null;
  delivery_time: string | null;
  download_file_path: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  /** شارة نصية مخصصة على الكارت (زي «تسليم سريع») — غير «جديد» */
  badge: string | null;
  /** كارت مميز بحدّ ملوّن (accent border) */
  highlighted: boolean;
  details: ProductDetailsContent | null;
  sort_order: number;
  created_at: string;
  images: ProductImage[];
  packages: Package[];
}

export interface Order {
  id: string;
  order_number: string;
  product_id: string | null;
  product_name: string;
  package_id: string | null;
  package_name: string | null;
  customer_name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  business_name: string | null;
  notes: string | null;
  product_count: number | null;
  style: string | null;
  product_photos: string[] | null;
  /** حقول الطلب العامة للمنتج (من details.order.fields) — {key: value} */
  extra_fields: Record<string, string> | null;
  payment_method: PaymentMethod;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  total: number;
  receipt_url: string | null;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  text: string;
  rating: number;
  created_at: string;
}

export interface SiteMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  id?: string;
  store_name: string;
  whatsapp_number: string;
  instapay_address: string;
  vodafone_cash_number: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  hero_title: string;
  hero_subtitle: string;
  announcement_text: string;
}
