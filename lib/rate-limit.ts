import { NextResponse } from "next/server";

/**
 * حدّ معدل بسيط في الذاكرة للروابط العامة (M-2).
 *
 * ملاحظة صريحة عن الحدود: على Vercel الـ serverless كل نسخة شغالة ليها
 * عدّادها الخاص، فده حماية «أفضل من لا شيء» ضد السبام وتخمين الأكواد
 * وتعداد الطلبات — مش حدّ موزّع دقيق على مستوى كل النسخ. لو احتجنا
 * حدّاً صارماً موحداً، الحل Upstash Ratelimit (خدمة مدفوعة).
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  // Vercel بيحط الـ IP الحقيقي للعميل في x-real-ip، وبيضيفه في آخر
  // x-forwarded-for. أخذ أول قيمة في x-forwarded-for غلط — لأن العميل
  // نفسه يقدر يزوّرها في الطلب ويتهرب من الحدّ (أو يحدّ غيره).
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "unknown";
}

/** بيرجع null لو الطلب مسموح، أو رد 429 جاهز لو تجاوز الحد. */
export function rateLimitResponse(
  req: Request,
  key: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();
  const mapKey = `${key}:${clientIp(req)}`;

  // تنظيف دوري خفيف عشان الـ Map متكبرش بلا حدود
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(mapKey);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(mapKey, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "محاولات كتير في وقت قصير — استنى شوية وحاول تاني" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  bucket.count += 1;
  return null;
}
