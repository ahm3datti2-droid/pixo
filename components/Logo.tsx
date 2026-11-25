/** شعار Pixo: كلمة pixo صغيرة، ونقطة الـ i مربع صغير سماوي (بكسل) */
export default function Logo({ className = "h-9 w-auto", dark = false }: { className?: string; dark?: boolean }) {
  const textColor = dark ? "#ffffff" : "currentColor";
  return (
    <svg viewBox="0 0 96 40" className={className} role="img" aria-label="Pixo" fill="none">
      <text x="0" y="31" fontSize="32" fontWeight="800" fontFamily="inherit" fill={textColor}>
        p
      </text>
      {/* حرف i: عمود + مربع سماوي بدل النقطة */}
      <rect x="27.5" y="13" width="6" height="18" rx="1.5" fill={textColor} />
      <rect x="27" y="3.5" width="7" height="7" rx="1.5" fill="#00D1FF" />
      <text x="39" y="31" fontSize="32" fontWeight="800" fontFamily="inherit" fill={textColor}>
        xo
      </text>
    </svg>
  );
}
