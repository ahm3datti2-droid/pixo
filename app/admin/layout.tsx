"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import Logo from "@/components/Logo";
import { adminLogout } from "@/lib/admin-client";

const NAV = [
  { href: "/admin", label: "📊 نظرة عامة" },
  { href: "/admin/products", label: "🛍️ المنتجات" },
  { href: "/admin/categories", label: "🗂️ التصنيفات" },
  { href: "/admin/orders", label: "📦 الطلبات" },
  { href: "/admin/coupons", label: "🎟️ الكوبونات" },
  { href: "/admin/portfolio", label: "🖼️ الأعمال" },
  { href: "/admin/testimonials", label: "⭐ آراء العملاء" },
  { href: "/admin/messages", label: "✉️ الرسائل" },
  { href: "/admin/settings", label: "⚙️ الإعدادات" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</div>;
  }

  async function logout() {
    await adminLogout();
    router.replace("/admin/login");
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2 text-ink dark:text-white">
            <Logo className="h-8 w-auto" />
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">لوحة الأدمن</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
              عرض الموقع ↗
            </Link>
            <button type="button" onClick={logout} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-95">
              تسجيل الخروج
            </button>
          </div>
        </div>

        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="أقسام لوحة الأدمن">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  active ? "bg-primary text-white shadow" : "bg-white text-slate-600 hover:bg-primary-light hover:text-primary dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </AdminGuard>
  );
}
