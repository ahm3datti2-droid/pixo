-- ============================================================
-- Pixo — إضافة خدمة «صور منتجات احترافية بالذكاء الاصطناعي»
-- نفّذ الملف ده في Supabase SQL Editor (مشروع pixo)
-- آمن لو اتنفذ أكتر من مرة (كل إضافة محمية بـ if not exists / on conflict)
-- ============================================================

-- ---------- أعمدة جديدة ----------
alter table products add column if not exists is_new boolean not null default false;
alter table products add column if not exists details jsonb;
alter table orders add column if not exists product_count int;
alter table orders add column if not exists style text;
alter table orders add column if not exists product_photos jsonb not null default '[]'::jsonb;

-- ---------- المنتج ----------
insert into products (name, slug, category_id, delivery_type, short_description, description, features, price, old_price, delivery_time, is_featured, is_new, details, sort_order) values
(
  'صور منتجات احترافية بالذكاء الاصطناعي',
  'صور-منتجات-احترافية-بالذكاء-الاصطناعي',
  (select id from categories where slug = 'تصميم-وموشن-جرافيك'),
  'service',
  'صوّر منتجك بموبايلك على أي خلفية.. ونرجعهولك صورة ستوديو احترافية جاهزة للبيع.',
  'مش محتاج مصوّر ولا ستوديو. صوّر منتجك بموبايلك، وإحنا نحوّله لصور احترافية بخلفيات ستوديو أو مشاهد إعلانية، جاهزة لصفحتك ومتجرك وإعلاناتك.',
  '["خلفية ستوديو نضيفة أو مشهد إعلاني حسب اختيارك", "تحسين الإضاءة والألوان", "مقاسات جاهزة للبوست والستوري والمتجر", "تعديل واحد مجاني على كل صورة"]'::jsonb,
  350, null, '24 لـ 48 ساعة من استلام الصور', true, true,
  '{"steps":{"title":"إزاي بتشتغل؟","items":["اختار الباقة وادفع","ابعتلنا صور منتجاتك من الموبايل","استلم صورك الاحترافية خلال 48 ساعة"]},"tips":{"title":"عشان تطلع أحسن نتيجة","items":["صوّر في مكان فيه إضاءة كويسة","خلّي المنتج واضح وكامل في الصورة","صوّر من أكتر من زاوية"]},"faq":[{"q":"لازم الصورة تكون احترافية؟","a":"لأ خالص، أي صورة واضحة من الموبايل كفاية."},{"q":"ينفع أختار شكل الخلفية؟","a":"أيوه، اكتبلنا الستايل اللي تحبه أو ابعت صورة مثال."},{"q":"ينفع للملابس والأكل؟","a":"أيوه، لأغلب المنتجات. ولو منتجك محتاج حاجة خاصة هنقولك قبل ما تدفع."}],"order":{"product_count":true,"styles":["خلفية بيضاء ستوديو","خلفية ملونة","مشهد إعلاني","سيبوها علينا"],"product_photos":true}}'::jsonb,
  5
)
on conflict (slug) do nothing;

-- ---------- الباقات (بتتضاف بس لو مش موجودة) ----------
insert into packages (product_id, name, price, features, sort_order)
select id, 'باقة 5 صور', 350, '[]'::jsonb, 1 from products
where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي'
  and not exists (select 1 from packages p where p.product_id = products.id and p.name = 'باقة 5 صور')
union all
select id, 'باقة 15 صورة', 900, '[]'::jsonb, 2 from products
where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي'
  and not exists (select 1 from packages p where p.product_id = products.id and p.name = 'باقة 15 صورة')
union all
select id, 'باقة 30 صورة', 1600, '[]'::jsonb, 3 from products
where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي'
  and not exists (select 1 from packages p where p.product_id = products.id and p.name = 'باقة 30 صورة');

-- ---------- صورة الغلاف ----------
insert into product_images (product_id, url, sort_order)
select id, '/images/products/ai-product-photos.svg', 1 from products
where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي'
  and not exists (select 1 from product_images pi where pi.product_id = products.id and pi.url = '/images/products/ai-product-photos.svg');

-- ---------- تحقق ----------
select name, slug, price, is_new, is_featured, sort_order
from products where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي';
select name, price from packages
where product_id = (select id from products where slug = 'صور-منتجات-احترافية-بالذكاء-الاصطناعي')
order by sort_order;
