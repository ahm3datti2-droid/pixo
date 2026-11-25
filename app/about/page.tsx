import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "من نحن",
  description: "Pixo — متجر مصري للحلول الديجيتال الجاهزة والخدمات الثابتة السعر لبيزنس أقوى.",
};

export default async function AboutPage() {
  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsapp_number, "أهلاً Pixo، عايز أستفسر عن خدماتكم");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">من نحن</h1>
      <div className="mt-6 space-y-5 rounded-3xl border border-slate-100 bg-white p-6 text-lg leading-relaxed text-slate-600 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        <p>
          <strong className="text-primary dark:text-accent">Pixo</strong> متجر مصري للحلول الديجيتال الجاهزة.
          إحنا بنبني منتجات رقمية وخدمات ثابتة السعر تساعد أصحاب البيزنس — من المحلات الصغيرة للعيادات
          والكافيهات والبراندات — إنهم يشتغلوا أونلاين بشكل احترافي من غير تعقيد ومن غير تكاليف مبالغ فيها.
        </p>
        <p>
          فكرتنا بسيطة: بدل ما تدفع آلاف الجنيهات في تطوير مخصص بياخد شهور، تختار حل جاهز ومجرّب،
          تدفع سعره الواضح، وتستلمه في معاد محدد. متجر إلكتروني بطلب على واتساب، منيو ديجيتال بكود QR،
          نظام حجز، لوجو وهوية بصرية، أو باقة تسويق شهرية — كل حاجة ليها سعر ثابت ومدة تسليم مكتوبة قبل ما تطلب.
        </p>
        <p>
          إحنا مؤمنين إن البيزنس المصري يستاهل أدوات ديجيتال قوية وبأسعار في متناوله، وإن الدفع لازم يكون
          سهل: إنستاباي أو فودافون كاش، من غير بوابات دفع معقدة. وهدفنا إن كل عميل يخلص طلبه وهو عارف
          بالظبط هيستلم إيه وإمتى وبكام.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {[
          { t: "أسعار ثابتة", d: "السعر اللي شايفه هو اللي بتدفعه — من غير مصاريف مخفية ولا مفاجآت." },
          { t: "تسليم في معاده", d: "كل منتج ليه مدة تسليم واضحة، وبنتابع معاك على واتساب لحد التسليم." },
          { t: "دعم بعد التسليم", d: "بعد ما تستلم شغلك بنفضل معاك لو محتاج تعديل أو مساعدة." },
        ].map((c) => (
          <div key={c.t} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="font-extrabold text-ink dark:text-white">{c.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-l from-primary to-[#2b1a7a] p-8 text-center text-white">
        <h2 className="text-2xl font-extrabold">عندك سؤال أو فكرة مشروع؟</h2>
        <p className="mt-2 text-white/85">كلمنا واتساب وهنرد عليك في أقرب وقت.</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-accent px-7 py-3.5 font-bold text-night transition hover:brightness-95">
          كلمنا واتساب
        </a>
        <Link href="/products" className="mt-3 block font-bold text-white underline sm:inline-block sm:mr-4 sm:mt-0">
          أو تصفح المنتجات
        </Link>
      </div>
    </div>
  );
}
