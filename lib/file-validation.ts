/**
 * التحقق من الملفات المرفوعة على السيرفر (M-3):
 * امتداد + MIME + magic bytes (البايتات الأولى الفعلية للملف).
 * `file.type` اللي المتصفح بيبعته ممكن يتزور، فالحكم النهائي دايماً
 * للـ magic bytes — وده اللي بيمنع رفع HTML/SVG فيه سكربت متنكر كصورة.
 */

type Kind = {
  ext: string;
  mime: string;
  /** بيرجع true لو البايتات الأولى تطابق النوع ده فعلاً */
  check: (b: Uint8Array) => boolean;
};

const startsWith = (b: Uint8Array, prefix: number[]) =>
  prefix.every((v, i) => b[i] === v);

/** صور المنتجات والإيصالات — SVG وHTML مرفوضين تماماً (ممكن يشيلوا سكربت). */
export const IMAGE_KINDS: Kind[] = [
  { ext: "jpg", mime: "image/jpeg", check: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { ext: "jpeg", mime: "image/jpeg", check: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { ext: "png", mime: "image/png", check: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { ext: "gif", mime: "image/gif", check: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]) },
  {
    ext: "webp",
    mime: "image/webp",
    check: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b.slice(8), [0x57, 0x45, 0x42, 0x50]),
  },
];

/** ملفات التحميل للمنتجات الرقمية — PDF وZIP بس. */
export const DOWNLOAD_KINDS: Kind[] = [
  { ext: "pdf", mime: "application/pdf", check: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]) },
  {
    ext: "zip",
    mime: "application/zip",
    check: (b) =>
      startsWith(b, [0x50, 0x4b, 0x03, 0x04]) ||
      startsWith(b, [0x50, 0x4b, 0x05, 0x06]) ||
      startsWith(b, [0x50, 0x4b, 0x07, 0x08]),
  },
];

export type ValidatedFile =
  | { ok: true; ext: string; mime: string }
  | { ok: false; error: string };

/** بيتحقق من الامتداد والمحتوى الفعلي، وبيرجع الامتداد والـ MIME الموثوقين. */
export async function validateUpload(file: File, allowed: Kind[]): Promise<ValidatedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
  const kind = allowed.find((k) => k.ext === ext);
  if (!kind) {
    return {
      ok: false,
      error: `نوع الملف مش مسموح — المسموح: ${allowed.map((k) => k.ext).join("، ")}`,
    };
  }
  // لو المتصفح بعت MIME مخالف للامتداد، ارفض — دي علامة تزوير واضحة
  if (file.type && file.type !== kind.mime) {
    return { ok: false, error: "نوع الملف مش مطابق للامتداد بتاعه" };
  }
  const head = new Uint8Array((await file.arrayBuffer()).slice(0, 16));
  if (!kind.check(head)) {
    return { ok: false, error: "محتوى الملف مش مطابق لنوعه — اتأكد إن الملف سليم" };
  }
  return { ok: true, ext: kind.ext, mime: kind.mime };
}
