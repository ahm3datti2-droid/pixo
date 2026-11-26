import Link from "next/link";
import { fetchCategories, fetchPortfolio, fetchProducts, fetchTestimonials } from "@/lib/data";
import { ARTICLES, formatArticleDate } from "@/lib/articles";
import { getSettings } from "@/lib/settings";
import ProductCard from "@/components/ProductCard";
import { formatPrice, whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, string> = {
  "أنظمة ومواقع جاهزة": "🌐",
  "باقات تسويق": "📣",
  "تصميم وموشن جرافيك": "🎨",
  "قوالب للتحميل": "📥",
  "اشتراكات شهرية": "🔁",
};

const FAQ = [
  {
    q: "إزاي أطلب من Pixo؟",
    a: "اختار المنتج اللي عايزه واضغط «اطلب دلوقتي»، املى بياناتك، وادفع بإنستاباي أو فودافون كاش، وبعدين ارفع سكرين شوت التحويل. أول ما نأكد الدفع بنبدأ التنفيذ أو بنبعت لك رابط التحميل.",
  },
  {
    q: "إيه طرق الدفع المتاحة؟",
    a: "الدفع حالياً بإنستاباي أو فودافون كاش. بيانات الدفع بتظهر لك في صفحة الطلب، وبعد التحويل بترفع صورة الإيصال عشان نأكد طلبك بسرعة.",
  },
  {
    q: "هستلم شغلي إمتى؟",
    a: "كل منتج مكتوب قدامه مدة التسليم: المنتجات الفورية بتوصلك بعد تأكيد الدفع مباشرة، والخدمات المنفذة ليك زي اللوجو والمتجر بتتسلم في المدة المكتوبة على صفحة المنتج (من 3 لـ 7 أيام عادة).",
  },
  {
    q: "أقدر أعدّل على شغلي بعد التسليم؟",
    a: "أيوه، كل خدمة بتشمل تعديلات مجانية موضحة في تفاصيل المنتج. لو محتاج تعديل إضافي بعد كده بنتفق عليه مع بعض قبل التنفيذ.",
  },
  {
    q: "سياسة الاسترجاع إيه؟",
    a: "المنتجات الرقمية الفورية غير قابلة للاسترجاع بعد إرسال رابط التحميل، والخدمات غير قابلة للاسترجاع بعد بدء التنفيذ. التفاصيل كاملة في صفحة سياسة الاسترجاع.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "اختار المنتج",
    text: "تصفح المنتجات واختار اللي يناسب بيزنسك، وشوف السعر ومدة التسليم وكل التفاصيل قبل ما تطلب.",
  },
  {
    n: "2",
    title: "ادفع بإنستاباي أو فودافون كاش",
    text: "حوّل المبلغ بالطريقة اللي تريحك وارفع سكرين شوت التحويل — وهنأكد طلبك في أسرع وقت.",
  },
  {
    n: "3",
    title: "استلم شغلك",
    text: "المنتجات الفورية بتوصلك على طول، والخدمات بنسلّمها لك في المعاد المتفق عليه مع دعم كامل.",
  },
];

export default async function HomePage() {
  const [settings, categories, products, portfolio, testimonials] = await Promise.all([
    getSettings(),
    fetchCategories(),
    fetchProducts(),
    fetchPortfolio(),
    fetchTestimonials(),
  ]);
  const featured = products.filter((p) => p.is_featured).slice(0, 6);
  const wa = whatsappLink(settings.whatsapp_number, "أهلاً Pixo، عايز أستفسر عن منتجاتكم");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary via-[#5a3df0] to-[#2b1a7a] text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              متجر ديجيتال مصري • دفع بإنستاباي أو فودافون كاش
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.25] sm:text-5xl">{settings.hero_title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-white/85">{settings.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-accent px-7 py-3.5 font-bold text-night shadow-lg shadow-cyan-500/30 transition hover:brightness-95"
              >
                تصفح المنتجات
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/15 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/25"
              >
                كلمنا واتساب
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-white/85">
              <span>✓ أسعار ثابتة وواضحة</span>
              <span>✓ تسليم في معاد محدد</span>
              <span>✓ دعم بعد التسليم</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">تصفح حسب التصنيف</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">اختار التصنيف اللي يناسب احتياجك</p>
          </div>
          <Link href="/products" className="hidden font-bold text-primary hover:underline dark:text-accent sm:block">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id || p.category_name === cat.name).length;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-2xl transition group-hover:scale-110 dark:bg-primary/25">
                  {CATEGORY_ICONS[cat.name] ?? "✦"}
                </div>
                <h3 className="mt-3 font-bold leading-snug text-ink dark:text-white">{cat.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{count} منتج</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">منتجات مميزة</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">أكتر الحلول اللي عملاؤنا بيطلبوها</p>
          </div>
          <Link href="/products" className="hidden font-bold text-primary hover:underline dark:text-accent sm:block">
            عرض كل المنتجات ←
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How to order */}
      <section className="bg-white py-14 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">إزاي تطلب؟</h2>
          <p className="mt-2 text-center text-slate-500 dark:text-slate-400">3 خطوات بس وتستلم شغلك</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-3xl border border-slate-100 bg-mist p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white shadow-lg shadow-primary/30">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">من أعمالنا</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">نماذج من الشغل اللي سلّمناه</p>
            </div>
            <Link href="/works" className="hidden font-bold text-primary hover:underline dark:text-accent sm:block">
              عرض كل الأعمال ←
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.slice(0, 6).map((w) => (
              <div key={w.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                {w.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.image_url} alt={w.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-primary to-accent text-5xl font-extrabold text-white">
                    {w.title.trim().charAt(0)}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-ink dark:text-white">{w.title}</h3>
                  {w.category && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{w.category}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — بتظهر بس لو فيه آراء حقيقية متسجلة */}
      {testimonials.length > 0 && (
        <section className="bg-white py-14 dark:bg-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">قالوا عنا</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="rounded-3xl border border-slate-100 bg-mist p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="text-amber-400" aria-label={`تقييم ${t.rating} من 5`}>
                    {"★".repeat(Math.max(1, Math.min(5, t.rating)))}
                    {"☆".repeat(5 - Math.max(1, Math.min(5, t.rating)))}
                  </div>
                  <blockquote className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">“{t.text}”</blockquote>
                  <figcaption className="mt-4 font-bold text-ink dark:text-white">
                    {t.name}
                    {t.role ? <span className="block text-sm font-normal text-slate-400">{t.role}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">من المدونة</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">نصايح عملية تفيد بيزنسك</p>
          </div>
          <Link href="/blog" className="hidden font-bold text-primary hover:underline dark:text-accent sm:block">
            عرض كل المقالات ←
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${encodeURIComponent(a.slug)}`}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-bl from-primary via-[#5a3df0] to-[#2b1a7a] text-6xl">
                {a.emoji}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-primary-light px-3 py-1 text-primary dark:bg-primary/20 dark:text-violet-300">
                    {a.category}
                  </span>
                  <span className="text-slate-400">
                    {formatArticleDate(a.date)} • {a.readingMinutes} دقايق قراءة
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold leading-snug text-ink group-hover:text-primary dark:text-white dark:group-hover:text-accent">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{a.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">أسئلة شائعة</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm open:border-primary/30 dark:border-white/10 dark:bg-white/5">
              <summary className="cursor-pointer list-none font-bold text-ink marker:hidden dark:text-white">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-primary transition group-open:rotate-45 dark:text-accent">+</span>
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary to-[#2b1a7a] p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">جاهز تكبّر بيزنسك؟</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/85">
            اختار المنتج المناسب ليك دلوقتي، أو كلمنا واتساب وهنساعدك تختار الحل الصح لبيزنسك.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="rounded-full bg-accent px-7 py-3.5 font-bold text-night transition hover:brightness-95">
              تصفح المنتجات
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-7 py-3.5 font-bold text-primary transition hover:bg-white/90"
            >
              كلمنا واتساب
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
