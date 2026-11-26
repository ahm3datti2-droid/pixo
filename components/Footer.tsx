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
            <a href={whatsappLink(settings.whatsapp_number, "أهلاً Pixo، عايز أستفسر عن منتجاتكم")} target="_blank" rel="noopener noreferrer" aria-label="واتساب" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] transition hover:brightness-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </a>
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
            <li><Link href="/blog" className="hover:text-accent">المدونة</Link></li>
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
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
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
