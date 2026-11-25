import type { Metadata } from "next";
import { fetchPortfolio } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "أعمالنا",
  description: "نماذج من أعمال Pixo: متاجر إلكترونية، منيو ديجيتال، أنظمة حجز، وهويات بصرية.",
};

export default async function WorksPage() {
  const portfolio = await fetchPortfolio();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">أعمالنا</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        نماذج من الشغل اللي سلّمناه لعملائنا — وكل شغل جديد بنضيفه هنا أول بأول.
      </p>
      {portfolio.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-white/15">
          لسه بنجهز معرض أعمالنا — تابعنا قريب.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((w) => (
            <article key={w.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              {w.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.image_url} alt={w.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-primary to-accent text-5xl font-extrabold text-white">
                  {w.title.trim().charAt(0)}
                </div>
              )}
              <div className="p-5">
                <h2 className="font-bold text-ink dark:text-white">{w.title}</h2>
                {w.category && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{w.category}</p>}
                {w.link && (
                  <a href={w.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-bold text-primary hover:underline dark:text-accent">
                    مشاهدة العمل ←
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
