"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { whatsappLink } from "@/lib/utils";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/works", label: "أعمالنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/about", label: "من نحن" },
  { href: "/track", label: "تتبع طلبك" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header({
  whatsappNumber,
  announcementText,
}: {
  whatsappNumber: string;
  announcementText: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {announcementText ? (
        <div className="bg-night px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
          <span className="text-accent">✦</span> {announcementText}
        </div>
      ) : null}
      <div className="border-b border-slate-100 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-night/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-ink dark:text-white" aria-label="Pixo — الرئيسية">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-primary-light hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={whatsappLink(whatsappNumber, "أهلاً Pixo، عايز أستفسر عن منتجاتكم")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 sm:flex"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.5 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
              </svg>
              واتساب
            </a>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-white/15 dark:text-slate-200 lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-slate-100 px-4 py-3 dark:border-white/10 lg:hidden" aria-label="قائمة الموبايل">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-slate-700 hover:bg-primary-light hover:text-primary dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={whatsappLink(whatsappNumber, "أهلاً Pixo، عايز أستفسر عن منتجاتكم")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-xl bg-[#25D366] px-3 py-3 text-center text-base font-bold text-white"
              >
                كلمنا واتساب
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
