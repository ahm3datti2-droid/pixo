import Link from "next/link";
import Logo from "./Logo";
import type { SiteSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 bg-night text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo className="h-9 w-auto" dark />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{settings.hero_title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            متجر مصري للحلول الديجيتال الجاهزة والخدمات الثابتة السعر — من غير شحن ومن غير تعقيد.
          </p>
          <div className="mt-4 flex gap-2">
            {settings.facebook_url ? (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8z" /></svg>
              </a>
            ) : null}
            {settings.instagram_url ? (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="إنستجرام" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
            ) : null}
            {settings.tiktok_url ? (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="تيك توك" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16.6 3c.4 2.1 1.8 3.6 4 3.9v3.1c-1.5 0-2.9-.5-4-1.3v6.1c0 3.4-2.6 6.2-6 6.2S4.5 18.2 4.5 14.8s2.7-6.2 6-6.2c.3 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-1.7 0-3 1.4-3 3.1s1.3 3.1 3 3.1 3-1.4 3-3.1V3h3.1z" /></svg>
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">روابط سريعة</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="hover:text-accent">كل المنتجات</Link></li>
            <li><Link href="/works" className="hover:text-accent">أعمالنا</Link></li>
            <li><Link href="/about" className="hover:text-accent">من نحن</Link></li>
            <li><Link href="/track" className="hover:text-accent">تتبع طلبك</Link></li>
            <li><Link href="/contact" className="hover:text-accent">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">سياسات المتجر</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/terms" className="hover:text-accent">الشروط والأحكام</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">سياسة الخصوصية</Link></li>
            <li><Link href="/refund" className="hover:text-accent">سياسة الاسترجاع</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">تواصل معنا</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              واتساب / موبايل:{" "}
              <a href={whatsappLink(settings.whatsapp_number)} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-accent" dir="ltr">
                {settings.whatsapp_number}
              </a>
            </li>
            <li>الدفع: إنستاباي أو فودافون كاش</li>
            <li>العملة: الجنيه المصري (ج.م)</li>
            <li>التسليم: رقمي بالكامل — بدون شحن</li>
          </ul>
          <a
            href={whatsappLink(settings.whatsapp_number, "أهلاً Pixo، عايز أستفسر عن منتجاتكم")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            كلمنا واتساب
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.store_name} — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
