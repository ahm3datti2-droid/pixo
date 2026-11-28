-- إصلاح الثغرة High (H-1) — 2026-11-28
-- المشكلة: كل سياسات "admin all *" كانت `for all to authenticated using (true)`،
-- فأي مستخدم مسجَّل دخول (وليس الأدمن فقط) كان يقدر يقرأ/يعدّل/يحذف كل الجداول
-- والملفات مباشرة عبر Supabase، متجاوزاً فحص ADMIN_EMAILS في التطبيق.
-- الحل: حذف كل سياسات `authenticated` نهائياً. التطبيق لا يستخدم المتصفح
-- للوصول للجداول أو التخزين إطلاقاً — كل القراءة/الكتابة تمر عبر روابط
-- Next.js (/api/*) بمفتاح Service Role (الذي يتجاوز RLS أصلاً)، والمتصفح
-- يستخدم عميل Supabase للمصادقة فقط (تسجيل دخول/جلسة) + إرفاق التوكن.
-- القراءة العامة (anon) للمنتجات والإعدادات لا تتأثر بهذا التغيير.
--
-- نفّذ هذا الملف في Supabase SQL Editor لمشروع pixo، ثم تحقق:
--   select schemaname, tablename, policyname from pg_policies
--    where policyname like 'admin %' order by tablename, policyname;
-- النتيجة المتوقعة: 0 صفوف.

drop policy if exists "admin all categories" on categories;
drop policy if exists "admin all products" on products;
drop policy if exists "admin all product images" on product_images;
drop policy if exists "admin all packages" on packages;
drop policy if exists "admin all orders" on orders;
drop policy if exists "admin all coupons" on coupons;
drop policy if exists "admin all portfolio" on portfolio;
drop policy if exists "admin all testimonials" on testimonials;
drop policy if exists "admin all messages" on messages;
drop policy if exists "admin all settings" on settings;

drop policy if exists "admin manage public-images" on storage.objects;
drop policy if exists "admin manage receipts" on storage.objects;
drop policy if exists "admin manage downloads" on storage.objects;
