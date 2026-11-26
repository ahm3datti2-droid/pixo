import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, formatArticleDate, getArticle } from "@/lib/articles";
import { fetchProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import ProductVisual from "@/components/ProductVisual";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) return { title: "المقال غير موجود" };
  return {
    title: `${article.title} | مدونة Pixo`,
    description: article.description,
    openGraph: {
      title: `${article.title} | Pixo`,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) notFound();

  const all = await fetchProducts();
  const related = all.filter((p) => article.relatedSlugs.includes(p.slug));

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pixo.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Pixo", url: base },
    publisher: { "@type": "Organization", name: "Pixo", url: base },
    mainEntityOfPage: `${base}/blog/${encodeURIComponent(article.slug)}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="font-bold text-primary hover:underline dark:text-accent">
        → كل المقالات
      </Link>

      <header className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-bl from-primary via-[#5a3df0] to-[#2b1a7a] p-8 text-center text-white sm:p-10">
        <div className="text-6xl">{article.emoji}</div>
        <span className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
          {article.category}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug sm:text-3xl">{article.title}</h1>
        <p className="mt-3 text-white/85">
          {formatArticleDate(article.date)} • {article.readingMinutes} دقايق قراءة
        </p>
      </header>

      <article className="mt-10">
        <p className="text-lg font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{article.description}</p>
        {article.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-xl font-extrabold text-ink dark:text-white">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-4 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-500/20">
                      ✓
                    </span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-ink dark:text-white">منتجات ليها علاقة بالمقال</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${encodeURIComponent(p.slug)}`}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <ProductVisual product={p} className="aspect-[16/10] w-full" />
                <div className="p-5">
                  <h3 className="font-bold text-ink group-hover:text-primary dark:text-white dark:group-hover:text-accent">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-lg font-extrabold text-primary dark:text-accent">
                    {formatPrice(p.price)}
                    {p.delivery_type === "subscription" ? " / شهرياً" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary to-[#2b1a7a] p-8 text-center text-white">
        <h2 className="text-xl font-extrabold">عايز تبدأ؟</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-white/85">
          شوف المنتجات المناسبة ليك، أو كلمنا واتساب وهنساعدك تختار الحل الصح لبيزنسك.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-full bg-accent px-7 py-3 font-bold text-night transition hover:brightness-95"
        >
          تصفح المنتجات
        </Link>
      </div>
    </div>
  );
}
