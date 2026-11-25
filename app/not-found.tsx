import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <div className="text-8xl font-extrabold text-primary dark:text-accent">404</div>
      <h1 className="mt-4 text-2xl font-bold text-ink dark:text-white">الصفحة دي مش موجودة</h1>
      <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
        ممكن يكون الرابط اتغير أو الصفحة اتمسحت. ارجع للرئيسية أو تصفح المنتجات من جديد.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark">
          الرجوع للرئيسية
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-ink transition hover:border-primary hover:text-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          تصفح المنتجات
        </Link>
      </div>
    </div>
  );
}
