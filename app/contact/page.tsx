import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "كلمنا على واتساب أو ابعت لنا رسالة من خلال النموذج — فريق Pixo بيرد عليك في أقرب وقت.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">تواصل معنا</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">عندك سؤال أو عايز تطلب خدمة مخصوصة؟ ابعت لنا أو كلمنا واتساب.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-[#2b1a7a] p-6 text-white shadow-lg">
            <h2 className="text-lg font-extrabold">أسرع طريقة للتواصل</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              كلمنا واتساب على رقم <span className="font-bold" dir="ltr">{settings.whatsapp_number}</span> وهنرد عليك في أقرب وقت.
            </p>
            <a
              href={whatsappLink(settings.whatsapp_number, "أهلاً Pixo، عايز أستفسر عن منتجاتكم")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-[#25D366] px-6 py-3 font-bold text-white transition hover:brightness-95"
            >
              افتح واتساب
            </a>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="font-extrabold text-ink dark:text-white">معلومات التواصل</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>واتساب / موبايل: <span className="font-bold text-ink dark:text-white" dir="ltr">{settings.whatsapp_number}</span></li>
              <li>الدفع: إنستاباي أو فودافون كاش</li>
              <li>العملة: الجنيه المصري (ج.م)</li>
              <li>كل منتجاتنا رقمية — بدون شحن</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
