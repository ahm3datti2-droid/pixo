"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, ORDER_STATUS_LABELS, whatsappLink } from "@/lib/utils";

type OrderDetail = Order & { receipt_signed_url: string | null; product_photos_signed_urls: string[] | null };

const STATUSES: OrderStatus[] = ["pending", "paid", "in_progress", "delivered", "cancelled"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await adminFetch(`/api/admin/orders/${params.id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "الطلب غير موجود");
      } else {
        const data = await res.json();
        setOrder(data.order as OrderDetail);
        setStatus((data.order as OrderDetail).status);
        setNotes((data.order as OrderDetail).admin_notes ?? "");
      }
      setLoading(false);
    })();
  }, [params.id]);

  async function save() {
    setSaving(true);
    setSaved("");
    const res = await adminFetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "تعذر حفظ التعديلات");
    } else {
      setSaved("تم الحفظ بنجاح ✓");
      setOrder((prev) => (prev ? { ...prev, status, admin_notes: notes } : prev));
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (error || !order) {
    return <p className="rounded-2xl bg-rose-50 p-4 text-center font-semibold text-rose-600 dark:bg-rose-500/10">{error || "الطلب غير موجود"}</p>;
  }

  const waMsg = `أهلاً ${order.customer_name}، بخصوص طلبك ${order.order_number} (${order.product_name}) — الحالة الحالية: ${ORDER_STATUS_LABELS[status]}.`;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">
        طلب <span dir="ltr">{order.order_number}</span>
      </h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">بيانات العميل</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-400">الاسم</dt><dd className="font-bold text-ink dark:text-white">{order.customer_name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">الموبايل</dt><dd className="font-bold text-ink dark:text-white" dir="ltr">{order.phone}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">واتساب</dt><dd className="font-bold text-ink dark:text-white" dir="ltr">{order.whatsapp}</dd></div>
              {order.email && <div className="flex justify-between gap-3"><dt className="text-slate-400">الإيميل</dt><dd className="font-bold text-ink dark:text-white" dir="ltr">{order.email}</dd></div>}
              {order.business_name && <div className="flex justify-between gap-3"><dt className="text-slate-400">البيزنس</dt><dd className="font-bold text-ink dark:text-white">{order.business_name}</dd></div>}
              {order.notes && <div className="flex justify-between gap-3"><dt className="text-slate-400">ملاحظات العميل</dt><dd className="font-bold text-ink dark:text-white">{order.notes}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-slate-400">طريقة الدفع</dt><dd className="font-bold text-ink dark:text-white">{order.payment_method === "instapay" ? "إنستاباي" : "فودافون كاش"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">تاريخ الطلب</dt><dd className="font-bold text-ink dark:text-white">{new Date(order.created_at).toLocaleString("ar-EG")}</dd></div>
            </dl>
            <a
              href={whatsappLink(order.whatsapp, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-full bg-[#25D366] py-3 text-center font-bold text-white transition hover:brightness-95"
            >
              مراسلة العميل على واتساب
            </a>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">تفاصيل الطلب</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-400">المنتج</dt><dd className="font-bold text-ink dark:text-white">{order.product_name}</dd></div>
              {order.package_name && <div className="flex justify-between gap-3"><dt className="text-slate-400">الباقة</dt><dd className="font-bold text-ink dark:text-white">{order.package_name}</dd></div>}
              {order.product_count != null && <div className="flex justify-between gap-3"><dt className="text-slate-400">عدد المنتجات</dt><dd className="font-bold text-ink dark:text-white">{order.product_count}</dd></div>}
              {order.style && <div className="flex justify-between gap-3"><dt className="text-slate-400">الستايل المطلوب</dt><dd className="font-bold text-ink dark:text-white">{order.style}</dd></div>}
              {order.coupon_code && <div className="flex justify-between gap-3"><dt className="text-slate-400">الكوبون</dt><dd className="font-bold text-ink dark:text-white" dir="ltr">{order.coupon_code}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-slate-400">المجموع الفرعي</dt><dd className="font-bold text-ink dark:text-white">{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-400">الخصم</dt><dd className="font-bold text-emerald-600">− {formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 dark:border-white/10"><dt className="font-bold text-ink dark:text-white">الإجمالي</dt><dd className="font-extrabold text-primary dark:text-accent">{formatPrice(order.total)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">إيصال الدفع</h2>
            {order.receipt_signed_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.receipt_signed_url} alt="إيصال الدفع" className="mt-4 w-full rounded-2xl border border-slate-100 dark:border-white/10" />
            ) : (
              <p className="mt-4 rounded-2xl bg-mist p-4 text-sm text-slate-400 dark:bg-white/10">العميل مرفعش صورة إيصال.</p>
            )}
          </div>

          {order.product_photos_signed_urls && order.product_photos_signed_urls.length > 0 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-lg font-extrabold text-ink dark:text-white">صور المنتجات ({order.product_photos_signed_urls.length})</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {order.product_photos_signed_urls.map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={`صورة منتج ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`صورة منتج ${i + 1}`} className="aspect-square w-full rounded-xl border border-slate-100 object-cover dark:border-white/10" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-extrabold text-ink dark:text-white">إدارة الطلب</h2>
            <label htmlFor="od-status" className="mb-1.5 mt-4 block text-sm font-bold text-ink dark:text-white">الحالة</label>
            <select
              id="od-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <label htmlFor="od-notes" className="mb-1.5 mt-4 block text-sm font-bold text-ink dark:text-white">ملاحظات داخلية (مش بيشوفها العميل)</label>
            <textarea
              id="od-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
              placeholder="مثال: تم التواصل مع العميل، بانتظار إرسال اللوجو…"
            />
            {saved && <p className="mt-3 text-sm font-bold text-emerald-600">{saved}</p>}
            <button type="button" onClick={save} disabled={saving} className="mt-4 w-full rounded-full bg-primary py-3.5 font-extrabold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60">
              {saving ? "جاري الحفظ…" : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                setDeleting(true);
                const res = await adminFetch(`/api/admin/orders/${params.id}`, { method: "DELETE" });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  setError((data as { error?: string }).error ?? "تعذر حذف الطلب");
                  setDeleting(false);
                  setConfirmDelete(false);
                } else {
                  router.replace("/admin/orders");
                }
              }}
              className={`mt-3 w-full rounded-full py-3 font-extrabold text-white transition disabled:opacity-60 ${confirmDelete ? "bg-rose-600 hover:bg-rose-700" : "bg-rose-500/90 hover:bg-rose-500"}`}
            >
              {deleting ? "جاري الحذف…" : confirmDelete ? "متأكد؟ اضغط تاني لحذف الطلب نهائياً" : "حذف الطلب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
