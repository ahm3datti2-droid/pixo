import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { contactSchema } from "@/lib/validation";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "خدمة الرسائل مش متاحة حالياً — المتجر لسه مش متصل بقاعدة البيانات" }, { status: 503 });
  }

  // حدّ معدل ضد السبام (M-2): 10 رسائل في الدقيقة لنفس الـ IP
  const limited = rateLimitResponse(req, "contact", 10);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات الرسالة مش صحيحة" }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot
  if (input.website && input.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("messages").insert({
    name: input.name,
    phone: input.phone || null,
    email: input.email || null,
    message: input.message,
  });
  if (error) {
    return NextResponse.json({ error: "تعذر إرسال الرسالة — حاول تاني" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
