import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import SplashScreen from "@/components/SplashScreen";
import MetaPixel from "@/components/MetaPixel";
import { getSettings } from "@/lib/settings";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pixoeg.store"),
  title: {
    default: "Pixo | حلول ديجيتال جاهزة لبيزنس أقوى",
    template: "%s | Pixo",
  },
  description:
    "Pixo متجر مصري للحلول الديجيتال الجاهزة: متاجر إلكترونية، منيو ديجيتال QR، أنظمة حجز، تصميم وهوية بصرية، وباقات تسويق شهرية. الدفع بإنستاباي أو فودافون كاش.",
  keywords: ["متجر إلكتروني", "منيو ديجيتال", "نظام حجز", "لوجو", "هوية بصرية", "تسويق", "موشن جرافيك", "Pixo"],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "Pixo",
    title: "Pixo | حلول ديجيتال جاهزة لبيزنس أقوى",
    description: "متاجر إلكترونية، منيو ديجيتال، أنظمة حجز، تصميم وهوية بصرية، وباقات تسويق — بأسعار ثابتة وواضحة.",
    images: [{ url: "/images/pixo-logo.jpg", width: 1640, height: 720, alt: "Pixo" }],
  },
  twitter: { card: "summary_large_image" },
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('pixo-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <MetaPixel />
        <SplashScreen />
        <Header whatsappNumber={settings.whatsapp_number} announcementText={settings.announcement_text} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
      </body>
    </html>
  );
}
