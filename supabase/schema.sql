-- ============================================================
-- Pixo — Supabase Schema
-- نفّذ الملف ده في Supabase: SQL Editor → New query → الصق الكود → Run
-- ============================================================

-- ---------- الجداول ----------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  delivery_type text not null check (delivery_type in ('instant_download', 'service', 'subscription')),
  short_description text not null default '',
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  price numeric(10, 2) not null check (price >= 0),
  old_price numeric(10, 2),
  demo_url text,
  delivery_time text,
  download_file_path text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  features jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  package_id uuid,
  package_name text,
  customer_name text not null,
  phone text not null,
  whatsapp text not null,
  email text,
  business_name text,
  notes text,
  payment_method text not null check (payment_method in ('instapay', 'vodafone_cash')),
  coupon_code text,
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  receipt_url text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'in_progress', 'delivered', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  expires_at timestamptz,
  max_uses int,
  uses_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null default '',
  link text,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  rating int not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Pixo',
  whatsapp_number text not null default '01117543009',
  instapay_address text not null default 'pixo@instapay',
  vodafone_cash_number text not null default '01117543009',
  facebook_url text not null default '',
  instagram_url text not null default '',
  tiktok_url text not null default '',
  hero_title text not null default 'حلول ديجيتال جاهزة لبيزنس أقوى',
  hero_subtitle text not null default 'متاجر إلكترونية، منيو ديجيتال، أنظمة حجز، تصميم وهوية بصرية، وباقات تسويق — كل اللي بيزنسك محتاجه في مكان واحد، بأسعار ثابتة وواضحة، وتسليم في معاد محدد.',
  announcement_text text not null default 'خصم لفترة محدودة على باقات التسويق — اطلب دلوقتي قبل ما العرض يخلص',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- الفهارس ----------

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active_featured on products(is_active, is_featured);
create index if not exists idx_product_images_product on product_images(product_id);
create index if not exists idx_packages_product on packages(product_id);
create index if not exists idx_orders_number on orders(order_number);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_coupons_code on coupons(code);
create index if not exists idx_messages_created on messages(created_at desc);

-- ---------- Row Level Security ----------

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table packages enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;
alter table portfolio enable row level security;
alter table testimonials enable row level security;
alter table messages enable row level security;
alter table settings enable row level security;

-- القراءة العامة: المنتجات النشطة بس + التصنيفات + الأعمال + الآراء + الإعدادات
create policy "public read active products" on products
  for select to anon, authenticated using (is_active = true);
create policy "public read categories" on categories
  for select to anon, authenticated using (true);
create policy "public read product images" on product_images
  for select to anon, authenticated using (true);
create policy "public read packages" on packages
  for select to anon, authenticated using (true);
create policy "public read portfolio" on portfolio
  for select to anon, authenticated using (true);
create policy "public read testimonials" on testimonials
  for select to anon, authenticated using (true);
create policy "public read settings" on settings
  for select to anon, authenticated using (true);

-- الكتابة: لا توجد أي سياسة إدخال عام — الطلبات والرسائل تُكتب عبر
-- /api/orders و/api/contact بمفتاح Service Role من السيرفر فقط.
-- (حُذفت سياستا "public insert orders/messages" في 2026-11-28 — كانتا
-- تسمحان لأي شخص بالمفتاح العام بإدخال طلبات/رسائل مباشرة عبر PostgREST
-- متجاوزاً تحقق zod والـ honeypot، والتطبيق أصلاً لا يستخدمهما.)

-- ---------- أرقام الطلبات والكوبونات الذرّية (M-4) ----------
-- sequence لرقم الطلب: طلبان متزامنان مش هياخدوا نفس الرقم أبداً.
create sequence if not exists order_number_seq;

-- ظبط الـ sequence على آخر رقم طلب موجود (مرة واحدة بس — لو اتستخدم قبل كده منسيبوش يرجع ورا).
-- في إعداد جديد (مفيش طلبات) بيبدأ من 10023.
do $$
declare
  v_max integer;
  v_called boolean;
begin
  select coalesce(max(cast(regexp_replace(order_number, '\D', '', 'g') as integer)), 10022)
    into v_max from orders;
  select is_called into v_called from order_number_seq;
  if not coalesce(v_called, false) then
    perform setval('order_number_seq', v_max, true);
  end if;
end $$;

create or replace function public.next_order_number()
returns integer language sql as $$
  select nextval('order_number_seq');
$$;
revoke execute on function public.next_order_number() from public;
grant execute on function public.next_order_number() to service_role;

-- زيادة عدّاد الكوبون ذرّياً وبشرط الحد الأقصى — بترجع false لو الكوبون خلص.
create or replace function public.apply_coupon(p_coupon_id uuid)
returns boolean language plpgsql as $$
declare applied boolean := false;
begin
  update coupons
     set uses_count = coalesce(uses_count, 0) + 1
   where id = p_coupon_id
     and (max_uses is null or coalesce(uses_count, 0) < max_uses)
  returning true into applied;
  return coalesce(applied, false);
end;
$$;
revoke execute on function public.apply_coupon(uuid) from public;
grant execute on function public.apply_coupon(uuid) to service_role;

-- الأدمن: لا توجد أي سياسة وصول مباشر للمستخدمين المسجَّلين.
-- (حُذفت سياسات "admin all *" في 2026-11-28 — كانت `for all to authenticated
-- using (true)` فتمنح أي حساب مسجَّل دخول صلاحيات كاملة على كل الجداول،
-- متجاوزةً فحص ADMIN_EMAILS في التطبيق. كل الوصول للأدمن يمر عبر روابط
-- /api/admin/* بمفتاح Service Role من السيرفر، الذي يتجاوز RLS أصلاً.
-- المتصفح يستخدم عميل Supabase للمصادقة فقط (تسجيل دخول/جلسة).)

-- ---------- Storage Buckets ----------

insert into storage.buckets (id, name, public)
values
  ('public-images', 'public-images', true),
  ('receipts', 'receipts', false),
  ('downloads', 'downloads', false)
on conflict (id) do nothing;

-- صور عامة: أي حد يقدر يشوفها. الرفع/الحذف يتم من السيرفر فقط
-- عبر /api/admin/upload بمفتاح Service Role — لا توجد سياسة وصول
-- مباشر للمستخدمين المسجَّلين (حُذفت "admin manage *" في 2026-11-28).
create policy "public read public-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-images');

-- الإيصالات والملفات: خاصة تماماً — مفيش وصول عام،
-- والتحميل بيتم من السيرفر بـ Service Role Key وروابط موقعة مؤقتة.
-- (لا توجد أي سياسة على هذين الباكتين — الوصول كله من السيرفر فقط.)
