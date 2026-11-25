import type { Metadata } from "next";
import TrackClient from "@/components/TrackClient";

export const metadata: Metadata = {
  title: "تتبع طلبك",
  description: "تابع حالة طلبك في Pixo برقم الطلب ورقم موبايلك، وحمّل ملفك لو كان جاهزاً.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-center text-3xl font-extrabold text-ink dark:text-white">تتبع طلبك</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-slate-500 dark:text-slate-400">
        اكتب رقم الطلب ورقم الموبايل اللي طلبت بيه، وهتشوف حالة طلبك لحظة بلحظة.
      </p>
      <div className="mt-8">
        <TrackClient />
      </div>
    </div>
  );
}
