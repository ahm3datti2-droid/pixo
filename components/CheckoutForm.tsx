"use client";

import { useMemo, useState } from "react";
import type { Product, SiteSettings } from "@/lib/types";
import { formatPrice, isValidEgyptianPhone, whatsappLink } from "@/lib/utils";
import { trackPixel } from "@/lib/pixel";
import { getBrowserClient } from "@/lib/supabase";
import { IMAGE_KINDS, validateUpload } from "@/lib/file-validation";

type SuccessData = { order_number: string; total: number; product_name: string };

export default function CheckoutForm({
  product,
  settings,
  initialPackageId,
}: {
  product: Product;
  settings: SiteSettings;
  initialPackageId: string | null;
}) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(initialPackageId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone_cash">("instapay");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; total: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");
  // حقول إضافية للمنتج — بتظهر بس لو المنتج فيه details.order (زي خدمة صور المنتجات)
  const orderExtras = product.details?.order;
  const [productCount, setProductCount] = useState("");
  const [style, setStyle] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState("");

  const pkg = product.packages.find((p) => p.id === selectedPackage) ?? null;
  const basePrice = pkg ? pkg.price : product.price;
  const discount = coupon ? coupon.discount : 0;
  const total = useMemo(() => Math.max(0, basePrice - discount), [basePrice, discount]);

  function copyText(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  /**
   * رفع صور المنتجات مباشرة لـ Supabase Storage بروابط رفع موقّعة
   * (عشان حجم الصور يتخطى حد جسم الطلب في Vercel لو اتبعتت مع الفورم).
   * الملفات بتتخزن في باكت receipts الخاص — نفس مكان الإيصالات — وبعدين
   * مساراتها بتتبعت مع الطلب. ملف اترفع واتشال من القايمة بيفضل في الباكت.
   */
  async function handlePhotos(list: FileList | null) {
    if (!list || list.length === 0) return;
    const base = photoPaths.length;
    const slots = 30 - base;
    if (slots <= 0) {
      setUploadMsg("وصلت للحد الأقصى: 30 صورة");
      return;
    }
    const toUpload = Array.from(list).slice(0, slots);
    const client = getBrowserClient();
    if (!client) {
      setUploadMsg("رفع الصور غير متاح دلوقتي — ابعتها على واتساب بعد الطلب");
      return;
    }
    setUploading(true);
    setUploadMsg("");
    let succeeded = 0;
    let lastError = "";
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadMsg(`جاري رفع الصور… ${base + i + 1} من ${base + toUpload.length}`);
      const check = await validateUpload(file, IMAGE_KINDS);
      if (!check.ok) {
        lastError = check.error;
        continue;
      }
      try {
        const res = await fetch("/api/orders/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });
        const data = await res.json();
        if (!res.ok || !data.signedUrl || !data.token || !data.path) {
          lastError = data.error || "تعذر رفع صورة — حاول تاني";
          continue;
        }
        const { error } = await client.storage.from("receipts").uploadToSignedUrl(data.path, data.token, file);
        if (error) {
          lastError = "تعذر رفع صورة — حاول تاني";
          continue;
        }
        succeeded++;
        setPhotoFiles((prev) => [...prev, file]);
        setPhotoPaths((prev) => [...prev, data.path]);
      } catch {
        lastError = "تعذر الاتصال بالسيرفر أثناء الرفع — حاول تاني";
      }
    }
    setUploading(false);
    if (succeeded > 0) setUploadMsg(`تم رفع ${base + succeeded} صورة من 30 ✓`);
    else if (lastError) setUploadMsg(lastError);
  }

  function removePhoto(idx: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPaths((prev) => prev.filter((_, i) => i !== idx));
  }

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponMsg("جاري التحقق من الكوبون…");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: basePrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCoupon(null);
        setCouponMsg(data.error || "الكوبون غير صالح");
        return;
      }
      setCoupon({ code: data.code, discount: data.discount, total: data.total });
      setCouponMsg(`تم تطبيق الكوبون — خصم ${formatPrice(data.discount)}`);
    } catch {
      setCouponMsg("تعذر التحقق من الكوبون — حاول تاني");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("من فضلك اكتب اسمك بالكامل");
    if (!isValidEgyptianPhone(phone)) return setError("رقم الموبايل غير صحيح — اكتب رقم مصري يبدأ بـ 01");
    if (!whatsapp.trim() || !isValidEgyptianPhone(whatsapp)) return setError("رقم الواتساب غير صحيح");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("الإيميل غير صحيح");
    if (receipt && receipt.size > 5 * 1024 * 1024) return setError("صورة الإيصال أكبر من 5 ميجا — اختار صورة أصغر");
    if (orderExtras?.product_count) {
      const n = Number(productCount);
      if (!productCount.trim() || !Number.isInteger(n) || n < 1 || n > 1000)
        return setError("من فضلك اكتب عدد المنتجات (رقم من 1 لـ 1000)");
    }
    if (orderExtras?.styles?.length) {
      if (!style || !orderExtras.styles.includes(style)) return setError("من فضلك اختار الستايل المطلوب");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("product_slug", product.slug);
      if (pkg) fd.append("package_id", pkg.id);
      fd.append("customer_name", name.trim());
      fd.append("phone", phone.trim());
      fd.append("whatsapp", whatsapp.trim());
      fd.append("email", email.trim());
      fd.append("business_name", businessName.trim());
      fd.append("notes", notes.trim());
      fd.append("payment_method", paymentMethod);
      fd.append("coupon_code", coupon ? coupon.code : "");
      fd.append("website", honeypot); // honeypot — لازم يفضل فاضي
      if (orderExtras?.product_count) fd.append("product_count", productCount.trim());
      if (orderExtras?.styles?.length) fd.append("style", style);
      if (orderExtras?.product_photos && photoPaths.length > 0)
        fd.append("product_photo_paths", JSON.stringify(photoPaths));
      if (receipt) fd.append("receipt", receipt);

      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حصلت مشكلة أثناء إرسال الطلب — حاول تاني");
        return;
      }
      setSuccess({ order_number: data.order_number, total: data.total, product_name: data.product_name });
      trackPixel("Purchase", {
        value: data.total,
        currency: "EGP",
        content_ids: [product.slug],
        content_name: data.product_name,
        content_type: "product",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("تعذر الاتصال بالسيرفر — اتأكد من النت وحاول تاني");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const waMsg = `أهلاً Pixo، أنا عملت طلب جديد.\nرقم الطلب: ${success.order_number}\nالمنتج: ${success.product_name}\nالإجمالي: ${formatPrice(success.total)}\nاسمي: ${name}`;
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white">✓</div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink dark:text-white">تم استلام طلبك بنجاح!</h1>
        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
          احتفظ برقم الطلب عشان تتابع حالته من صفحة «تتبع طلبك». واضغط على زر الواتساب عشان تبعت لنا تأكيد الطلب على طول.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white p-5 text-right shadow-sm dark:bg-white/10">
          <p className="flex justify-between text-sm"><span className="text-slate-400">رقم الطلب</span><span className="font-extrabold text-primary dark:text-accent" dir="ltr">{success.order_number}</span></p>
          <p className="mt-2 flex justify-between text-sm"><span className="text-slate-400">المنتج</span><span className="font-bold text-ink dark:text-white">{success.product_name}</span></p>
          <p className="mt-2 flex justify-between text-sm"><span className="text-slate-400">الإجمالي</span><span className="font-extrabold text-ink dark:text-white">{formatPrice(success.total)}</span></p>
        </div>
        {orderExtras?.product_photos && (
          photoPaths.length > 0 ? (
            <p className="mx-auto mt-4 max-w-sm rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10">
              تم رفع {photoPaths.length} صورة مع طلبك ✓
            </p>
          ) : (
            <div className="mx-auto mt-4 max-w-sm rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              مهم: ابعت صور منتجاتك على واتساب{" "}
              <span dir="ltr" className="font-extrabold">{settings.whatsapp_number}</span>{" "}
              مع رقم الطلب <span dir="ltr" className="font-extrabold">{success.order_number}</span> عشان نبدأ التنفيذ.
            </div>
          )
        )}
        <a
          href={whatsappLink(settings.whatsapp_number, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-[#25D366] px-8 py-3.5 font-bold text-white shadow-lg transition hover:brightness-95"
        >
          تأكيد الطلب على واتساب
        </a>
        <p className="mt-4 text-sm text-slate-400">لو ما بعتش رسالة الواتساب، طلبك متسجل عندنا وهنراجعه — بس الرسالة بتسرّع التأكيد.</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white";
  const labelCls = "mb-1.5 block text-sm font-bold text-ink dark:text-white";

  const paymentDetails =
    paymentMethod === "instapay"
      ? { label: "عنوان إنستاباي", value: settings.instapay_address }
      : { label: "رقم فودافون كاش", value: settings.vodafone_cash_number };

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-extrabold text-ink dark:text-white">بياناتك</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className={labelCls}>الاسم بالكامل *</label>
              <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="مثال: أحمد محمد" />
            </div>
            <div>
              <label htmlFor="cf-phone" className={labelCls}>رقم الموبايل *</label>
              <input id="cf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" dir="ltr" style={{ textAlign: "right" }} />
            </div>
            <div>
              <label htmlFor="cf-wa" className={labelCls}>رقم الواتساب *</label>
              <input id="cf-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" dir="ltr" style={{ textAlign: "right" }} />
            </div>
            <div>
              <label htmlFor="cf-email" className={labelCls}>الإيميل (اختياري)</label>
              <input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="name@email.com" dir="ltr" style={{ textAlign: "right" }} />
            </div>
            <div>
              <label htmlFor="cf-biz" className={labelCls}>اسم البيزنس (اختياري)</label>
              <input id="cf-biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} placeholder="اسم محلك أو شركتك" />
            </div>
            <div>
              <label htmlFor="cf-notes" className={labelCls}>ملاحظات (اختياري)</label>
              <input id="cf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="أي تفاصيل إضافية عن طلبك" />
            </div>
          </div>
          {/* Honeypot — حقل مخفي ضد السبام، لازم يفضل فاضي */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </div>

        {orderExtras && (orderExtras.product_count || orderExtras.styles?.length || orderExtras.product_photos) && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">تفاصيل الخدمة</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {orderExtras.product_count && (
                <div>
                  <label htmlFor="cf-count" className={labelCls}>عدد المنتجات *</label>
                  <input
                    id="cf-count"
                    type="number"
                    min={1}
                    max={1000}
                    value={productCount}
                    onChange={(e) => setProductCount(e.target.value)}
                    className={inputCls}
                    placeholder="مثال: 10"
                    inputMode="numeric"
                  />
                  <p className="mt-1 text-xs text-slate-400">عدد المنتجات اللي عايز صورها</p>
                </div>
              )}
              {orderExtras.styles?.length ? (
                <div>
                  <label htmlFor="cf-style" className={labelCls}>الستايل المطلوب *</label>
                  <select id="cf-style" value={style} onChange={(e) => setStyle(e.target.value)} className={inputCls}>
                    <option value="">اختار الستايل…</option>
                    {orderExtras.styles.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            {orderExtras.product_photos && (
              <div className="mt-4">
                <label htmlFor="cf-photos" className={labelCls}>ارفع صور منتجاتك (اختياري — حتى 30 صورة)</label>
                <input
                  id="cf-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    handlePhotos(e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white disabled:opacity-60 dark:border-white/20 dark:bg-white/5"
                />
                {uploading && uploadMsg && <p className="mt-2 text-sm text-slate-500">{uploadMsg}</p>}
                {!uploading && uploadMsg && (
                  <p className={`mt-2 text-sm ${uploadMsg.includes("✓") ? "text-emerald-600" : "text-rose-500"}`}>{uploadMsg}</p>
                )}
                {photoFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {photoFiles.map((f, i) => (
                      <span
                        key={photoPaths[i] ?? f.name}
                        className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        {f.name}
                        <button type="button" onClick={() => removePhoto(i)} aria-label="حذف الصورة" className="text-rose-500">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">لو ما رفعتش الصور دلوقتي، تقدر تبعتها على واتساب بعد الطلب مع رقم الطلب.</p>
              </div>
            )}
          </div>
        )}

        {product.packages.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">اختار الباقة</h2>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => { setSelectedPackage(null); setCoupon(null); setCouponMsg(""); }}
                className={`w-full rounded-2xl border-2 p-4 text-right transition ${!pkg ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 dark:border-white/15"}`}
              >
                <span className="flex justify-between"><span className="font-bold text-ink dark:text-white">السعر الأساسي</span><span className="font-extrabold text-primary dark:text-accent">{formatPrice(product.price)}</span></span>
              </button>
              {product.packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPackage(p.id); setCoupon(null); setCouponMsg(""); }}
                  className={`w-full rounded-2xl border-2 p-4 text-right transition ${pkg?.id === p.id ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 dark:border-white/15"}`}
                >
                  <span className="flex justify-between"><span className="font-bold text-ink dark:text-white">{p.name}</span><span className="font-extrabold text-primary dark:text-accent">{formatPrice(p.price)}</span></span>
                  <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{p.features.join(" • ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-extrabold text-ink dark:text-white">طريقة الدفع</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("instapay")}
              className={`rounded-2xl border-2 p-4 text-right transition ${paymentMethod === "instapay" ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 dark:border-white/15"}`}
            >
              <span className="font-bold text-ink dark:text-white">إنستاباي (InstaPay)</span>
              <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">تحويل فوري من أي بنك</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("vodafone_cash")}
              className={`rounded-2xl border-2 p-4 text-right transition ${paymentMethod === "vodafone_cash" ? "border-primary bg-primary-light/60 dark:bg-primary/15" : "border-slate-200 dark:border-white/15"}`}
            >
              <span className="font-bold text-ink dark:text-white">فودافون كاش</span>
              <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">تحويل من محفظتك</span>
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-mist p-4 dark:bg-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              حوّل <span className="font-extrabold text-primary dark:text-accent">{formatPrice(total)}</span> على {paymentDetails.label}:
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 dark:bg-night">
              <span className="font-extrabold text-ink dark:text-white" dir="ltr">{paymentDetails.value}</span>
              <button
                type="button"
                onClick={() => copyText(paymentDetails.value, paymentMethod)}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark"
              >
                {copied === paymentMethod ? "تم النسخ ✓" : "نسخ"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="cf-receipt" className={labelCls}>صورة إيصال التحويل (اختياري — بتسرّع التأكيد، حد أقصى 5 ميجا)</label>
            <input
              id="cf-receipt"
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/20 dark:bg-white/5"
            />
            {receipt && <p className="mt-2 text-sm text-emerald-600">تم اختيار: {receipt.name}</p>}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-extrabold text-ink dark:text-white">ملخص الطلب</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-extrabold text-white">
              {product.name.trim().charAt(0)}
            </div>
            <div>
              <p className="font-bold leading-snug text-ink dark:text-white">{product.name}</p>
              {pkg && <p className="text-sm text-slate-400">باقة: {pkg.name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="cf-coupon" className={labelCls}>كود خصم (لو معاك)</label>
            <div className="flex gap-2">
              <input id="cf-coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className={inputCls} placeholder="مثال: PIXO10" dir="ltr" style={{ textAlign: "right" }} />
              <button type="button" onClick={applyCoupon} className="shrink-0 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-ink">
                تطبيق
              </button>
            </div>
            {couponMsg && <p className={`mt-2 text-sm ${coupon ? "text-emerald-600" : "text-rose-500"}`}>{couponMsg}</p>}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-white/10">
            <p className="flex justify-between"><span className="text-slate-400">المجموع الفرعي</span><span className="font-bold text-ink dark:text-white">{formatPrice(basePrice)}</span></p>
            {discount > 0 && <p className="flex justify-between text-emerald-600"><span>الخصم</span><span className="font-bold">− {formatPrice(discount)}</span></p>}
            <p className="flex justify-between border-t border-slate-100 pt-2 text-base dark:border-white/10"><span className="font-bold text-ink dark:text-white">الإجمالي</span><span className="font-extrabold text-primary dark:text-accent">{formatPrice(total)}</span></p>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-4 text-lg font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "جاري إرسال الطلب…" : "تأكيد الطلب"}
          </button>
          <p className="text-center text-xs leading-relaxed text-slate-400">
            بالضغط على «تأكيد الطلب» أنت موافق على الشروط والأحكام وسياسة الاسترجاع الخاصة بـ Pixo.
          </p>
        </div>
      </div>
    </form>
  );
}
