-- Migration: باقة «بيزنسك أونلاين في 48 ساعة» + شارة مخصصة/تمييز الكارت + حقول طلب عامة
-- Idempotent — آمن يتطبق أكتر من مرة.
-- طبّقه من Supabase Dashboard → SQL Editor على مشروع pixo.

alter table products add column if not exists badge text;
alter table products add column if not exists highlighted boolean not null default false;
alter table orders add column if not exists extra_fields jsonb not null default '{}'::jsonb;

insert into products (name, slug, category_id, delivery_type, short_description, description, features, price, old_price, delivery_time, is_featured, is_new, badge, highlighted, details, sort_order) values
(
  'بيزنسك أونلاين في 48 ساعة',
  'بيزنسك-أونلاين-في-48-ساعة',
  (select id from categories where slug = 'أنظمة-ومواقع-جاهزة'),
  'service',
  'فاتح بيزنس جديد؟ في 48 ساعة هيبقى ليك لوجو وكارت ديجيتال وواتساب بيزنس متجهز وتسجيل على خرائط جوجل.',
  'كل اللي محتاجه عشان تبدأ أونلاين صح، في باقة واحدة وبسعر ثابت.. ومن غير ما تستنى أسابيع.',
  '["لوجو بسيط واحترافي", "كارت بيزنس ديجيتال", "تجهيز واتساب بيزنس", "تسجيل النشاط على خرائط جوجل"]'::jsonb,
  2500, null, '48 ساعة من استلام البيانات والدفع', true, false, 'تسليم سريع', true,
  '{"included":{"title":"الباقة فيها إيه؟","items":[{"title":"لوجو بسيط واحترافي","desc":"اقتراحين تختار منهم + تعديلين"},{"title":"كارت بيزنس ديجيتال","desc":"صفحة واحدة فيها كل وسايل التواصل، بتتفتح من لينك أو QR"},{"title":"تجهيز واتساب بيزنس","desc":"بروفايل كامل، كتالوج لحد 20 منتج، ورسايل ترحيب وردود تلقائية"},{"title":"تسجيل النشاط على خرائط جوجل","desc":"عشان الزباين تلاقيك لما تدوّر"}]},"note":"تفعيل خرائط جوجل بيتم حسب خطوات التحقق اللي جوجل بتطلبها، وإحنا بنجهزلك كل حاجة ونساعدك فيها.","steps":{"title":"إزاي بتشتغل؟","items":["اطلب الباقة وادفع","املأ بيانات البيزنس","استلم كل حاجة خلال 48 ساعة"]},"faq":[{"q":"الـ 48 ساعة بتبدأ إمتى؟","a":"من وقت ما نستلم الدفع وكل بيانات البيزنس."},{"q":"لو عندي لوجو بالفعل؟","a":"كلمنا على واتساب ونظبطلك الباقة من غير اللوجو."},{"q":"ينفع أطوّرها بعدين لمتجر كامل؟","a":"أكيد، وبنحسبلك اللي دفعته في الباقة دي من سعر المتجر."}],"order":{"require_business_name":true,"fields":[{"key":"activity_type","label":"نوع النشاط","type":"text","required":true,"placeholder":"مثال: مطعم، صيدلية، محل ملابس"},{"key":"business_whatsapp","label":"رقم واتساب البيزنس","type":"tel","required":true,"placeholder":"01xxxxxxxxx"},{"key":"address","label":"عنوان المحل أو المنطقة","type":"text","required":true,"placeholder":"مثال: شارع الثلاثيني، الإسماعيلية"},{"key":"social_link","label":"لينك صفحة فيسبوك أو إنستجرام","type":"url","required":false,"placeholder":"https://facebook.com/..."},{"key":"favorite_colors","label":"ألوان بتحبها","type":"text","required":false,"placeholder":"مثال: أزرق وذهبي"}]},"success_message":"تم استلام طلبك ✓ العد التنازلي للـ 48 ساعة هيبدأ بعد تأكيد الدفع. لأي استفسار: واتساب 01117543009"}'::jsonb,
  3
)
on conflict (slug) do nothing;

insert into product_images (product_id, url, sort_order)
select id, '/images/products/express-bundle-48h.svg', 1 from products where slug = 'بيزنسك-أونلاين-في-48-ساعة'
and not exists (select 1 from product_images where product_id = products.id and url = '/images/products/express-bundle-48h.svg');

-- Verification (النتيجتين لازم يظهروا):
select name, slug, price, badge, highlighted, is_featured, sort_order from products where slug = 'بيزنسك-أونلاين-في-48-ساعة';
select count(*) as products_count from products;
