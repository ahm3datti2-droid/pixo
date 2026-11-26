import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, formatArticleDate } from "@/lib/articles";

export const metadata: Metadata = {
  title: "المدونة | Pixo",
  description:
    "مقالات عملية عن المتاجر الإلكترونية، التسويق، والاشتراكات — نصايح تفيد بيزنسك من غير تعقيد.",
  openGraph: {
    title: "المدونة | Pixo",
    description: "مقالات عملية عن المتاجر الإلكترونية، التسويق، والاشتراكات — نصايح تفيد بيزنسك من غير تعقيد.",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-ink dark:text-white sm:text-4xl">المدونة</h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          مقالات عملية عن المتاجر الإلكترونية، التسويق، والاشتراكات — نصايح تفيد بيزنسك من غير تعقيد.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
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
              <h2 className="mt-3 text-lg font-extrabold leading-snug text-ink group-hover:text-primary dark:text-white dark:group-hover:text-accent">
                {a.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{a.description}</p>
              <span className="mt-4 inline-block font-bold text-primary dark:text-accent">اقرأ المقال ←</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
