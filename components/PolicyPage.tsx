import type { ReactNode } from "react";

export default function PolicyPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">آخر تحديث: {updated}</p>
      <div className="mt-6 space-y-6 rounded-3xl border border-slate-100 bg-white p-6 leading-relaxed text-slate-600 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-ink dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pr-5">
        {children}
      </div>
    </div>
  );
}
