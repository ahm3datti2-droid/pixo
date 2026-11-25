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
