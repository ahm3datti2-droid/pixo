# Pixo — متجر ديجيتال مصري 🟣

**Pixo** متجر إلكتروني عربي (RTL) لبيع المنتجات الرقمية والخدمات الثابتة السعر في مصر.
الدفع بإنستاباي أو فودافون كاش، والعملة جنيه مصري (ج.م)، والشعار: **"حلول ديجيتال جاهزة.. لبيزنس أقوى"**.

التقنيات: Next.js 16 + TypeScript + Tailwind CSS 4 — قاعدة البيانات والمصادقة والتخزين: **Supabase** — النشر: **GitHub → Vercel** (الخطة المجانية).

---

## الخطوة 1: اعمل مشروع Supabase

1. ادخل على [supabase.com](https://supabase.com) وسجّل دخول (أو اعمل حساب مجاني).
2. اضغط **New project** → اختار اسم للمشروع (مثال: `pixo`) وكلمة سر قوية لقاعدة البيانات → اختار أقرب منطقة (Frankfurt) → **Create new project**، واستنى دقيقة لحد ما يجهز.
3. من القائمة الجانبية ادخل على **SQL Editor** → **New query**.
4. افتح ملف `supabase/schema.sql` من المشروع ده، انسخ كل محتواه، والصقه في الـ SQL Editor واضغط **Run**. ده بينشئ كل الجداول وسياسات الأمان والباكتات التلاتة (`public-images` و`receipts` و`downloads`).
5. اعمل **New query** تانية، وانسخ محتوى ملف `supabase/seed.sql` والصقه واضغط **Run**. ده بيضيف الـ 5 تصنيفات والـ 9 منتجات والكوبون الترحيبي `PIXO10` وإعدادات المتجر.
6. اتأكد إن الباكتات اتعملت: من القائمة الجانبية **Storage** لازم تلاقي `public-images` (عام) و`receipts` و`downloads` (خاصين). لو مش موجودين، ارجع نفّذ `schema.sql` تاني.

## الخطوة 2: اعمل حساب الأدمن

1. من القائمة الجانبية في Supabase ادخل على **Authentication** → **Users** → **Add user** → **Create new user**.
2. اكتب إيميلك وكلمة سر قوية، وسيّب **Auto Confirm User** متفعّلة (عشان تقدر تدخل على طول من غير تأكيد إيميل) → **Create user**.
3. احفظ الإيميل وكلمة السر — دول اللي هتدخل بيهم لوحة الأدمن من `/admin/login`.

> ملحوظة: الدخول للوحة الأدمن مربوط بمتغير `ADMIN_EMAILS` (الخطوة 4). لازم الإيميل اللي عملته هنا يكون مكتوب هناك.

## الخطوة 3: ارفع المشروع على GitHub باسم `pixo`

1. ادخل على [github.com/new](https://github.com/new) واعمل Repository جديد باسم **`pixo`** (Public أو Private زي ما تحب) — **من غير** README ولا .gitignore (المشروع فيه ملفاته جاهزة).
2. من التيرمينال في مجلد المشروع نفّذ:

```bash
git init
git add .
git commit -m "Pixo store — first version"
git branch -M main
git remote add origin https://github.com/USERNAME/pixo.git
git push -u origin main
```

(بدّل `USERNAME` باسم حسابك على GitHub — ولو طلب منك تسجيل دخول، استخدم Personal Access Token بدل كلمة السر.)

## الخطوة 4: انشر على Vercel

1. ادخل على [vercel.com](https://vercel.com) وسجّل دخول بحساب GitHub بتاعك.
2. اضغط **Add New… → Project** → اختار الريبو **`pixo`** → **Import**.
3. سيب كل الإعدادات زي ما هي (Framework: Next.js) واضغط **Deploy** — أول نشر هياخد دقيقتين.
4. بعد ما يخلص، ادخل على **Project → Settings → Environment Variables** وضيف المتغيرات دي (القيم من Supabase):

| المتغير | منين تجيبه؟ |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (سري — متشاركوش مع حد) |
| `ADMIN_EMAILS` | إيميل الأدمن اللي عملته في الخطوة 2 (مثال: `admin@pixo.com`) |
| `NEXT_PUBLIC_SITE_URL` | رابط موقعك على Vercel (مثال: `https://pixo.vercel.app`) |

5. بعد إضافة المتغيرات اضغط **Redeploy** من تبويب **Deployments** (اختار آخر Deployment → ⋯ → Redeploy) عشان المتغيرات تتطبق.

## الخطوة 5: جرّب موقعك

- رابط الموقع هيكون شبه: **https://pixo.vercel.app** (أو أقرب اسم متاح — لو الاسم محجوز، Vercel هيقترح اسم تاني زي `pixo-xxx.vercel.app`).
- افتح الموقع وتأكد إن المنتجات ظاهرة.
- ادخل على `https://pixo.vercel.app/admin/login` وسجّل دخول بإيميل وكلمة سر الأدمن.
- من لوحة الأدمن عدّل رقم الواتساب وعنوان إنستاباي ورقم فودافون كاش من **الإعدادات** (الافتراضي: واتساب `01117543009`).

---

## التشغيل على جهازك (للتطوير)

```bash
npm install
cp .env.example .env.local   # وحط القيم بتاعتك في الملف
npm run dev                  # الموقع هيفتح على http://localhost:3000
npm run build                # للتأكد إن المشروع بيتبني من غير أخطاء
```

## صفحات الموقع

| الصفحة | الرابط |
|---|---|
| الرئيسية | `/` |
| كل المنتجات (بحث + فلترة + ترتيب) | `/products` |
| صفحة منتج | `/products/[slug]` |
| إتمام الطلب | `/checkout/[slug]` |
| تتبع طلبك | `/track` |
| أعمالنا / من نحن / تواصل | `/works` — `/about` — `/contact` |
| الشروط / الخصوصية / الاسترجاع | `/terms` — `/privacy` — `/refund` |
| لوحة الأدمن | `/admin` |

## ملاحظات مهمة

- **الموقع بيشتغل حتى من غير Supabase**: لو المفاتيح مش مضبوطة، الصفحات العامة بتعرض بيانات افتراضية جاهزة (الـ 9 منتجات)، والطلبات وتتبع الطلب هتظهر رسالة إن الإعداد لسه مش مكتمل.
- **الأسعار والكوبونات بتتحسب على السيرفر** — السعر اللي جاي من المتصفح مش بيتاخد بيه أبداً.
- **قسم «قالوا عنا» مش بيظهر على الموقع إلا لما تضيف آراء حقيقية** من لوحة الأدمن — مفيش آراء وهمية في المشروع.
- **روابط التحميل آمنة**: رابط التحميل بيتعمل بعد التحقق من رقم الطلب والموبايل، وبيكون صالح 24 ساعة بس.
- **مفتاح Service Role سري**: موجود في متغيرات Vercel بس، ومش بيظهر في كود المتصفح أبداً.
