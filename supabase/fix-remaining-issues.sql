-- إصلاحات باقي التقرير الأمني — 2026-11-28
-- M-4: رقم طلب ذرّي (sequence) + زيادة كوبون ذرّية مشروطة
-- L-4: حذف سياستي الإدخال العام غير المستخدمتين
--
-- نفّذ هذا الملف في Supabase SQL Editor لمشروع pixo، ثم تحقق:
--   select schemaname, tablename, policyname from pg_policies
--    where policyname like 'public insert%';
--   select next_order_number();
-- المتوقع: 0 صفوف للسياسات، ورقم أكبر من آخر رقم طلب موجود.

-- ---------- 1) رقم الطلب الذرّي ----------
create sequence if not exists order_number_seq;

-- ظبط الـ sequence على آخر رقم طلب موجود (مرة واحدة بس — لو اتستخدم قبل كده منسيبوش يرجع ورا)
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
-- الدالتان دول للسيرفر بس (Service Role) — مش لأي حد بالمفتاح العام،
-- عشان محدش يقدر يحرق أرقام طلبات أو يزوّد عدّاد كوبون من المتصفح.
revoke execute on function public.next_order_number() from public;
grant execute on function public.next_order_number() to service_role;

-- ---------- 2) زيادة الكوبون الذرّية ----------
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

-- ---------- 3) حذف سياستي الإدخال العام (L-4) ----------
-- التطبيق بيكتب الطلبات والرسائل عبر /api/orders و/api/contact
-- بمفتاح Service Role فقط — السياستان دول كانوا بيسمحوا لأي حد
-- بالمفتاح العام يدخل طلبات/رسائل مباشرة متجاوزاً تحقق zod والـ honeypot.
drop policy if exists "public insert orders" on orders;
drop policy if exists "public insert messages" on messages;
