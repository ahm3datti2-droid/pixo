"use client";

import { useEffect, useState } from "react";

/**
 * شاشة عرض اللوجو: بتظهر أول ما الموقع يفتح (مرة واحدة في الجلسة)،
 * وبعدين بتختفي بتدرّج ناعم. لو الصورة مش موجودة لأي سبب، الشاشة
 * بتتقفل على طول من غير ما تعطل الموقع.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("pixo-splash-shown")) {
        setGone(true);
        return;
      }
    } catch {
      // تجاهل أخطاء التخزين واعرض الشاشة عادي
    }
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 1700);
    const removeTimer = setTimeout(() => {
      setGone(true);
      try {
        sessionStorage.setItem("pixo-splash-shown", "1");
      } catch {
        // تجاهل
      }
    }, 2300);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#6C4DFF] transition-opacity duration-700 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pixo-logo.jpg"
        alt="Pixo"
        className="h-auto w-[min(78vw,420px)] animate-[splashZoom_1.4s_ease-out]"
        onError={() => setGone(true)}
      />
      <style>{`@keyframes splashZoom { from { transform: scale(.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
    </div>
  );
}
