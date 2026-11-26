/** شعار Pixo الحقيقي: الأيقونة البنفسجية اللي بعتها صاحب المتجر — مش نص مرسوم */
export default function Logo({ className = "h-9 w-9", dark = false }: { className?: string; dark?: boolean }) {
  void dark;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon.jpg" alt="Pixo" className={`${className} shrink-0 rounded-xl object-cover`} />
  );
}
