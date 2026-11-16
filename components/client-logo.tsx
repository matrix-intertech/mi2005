"use client";
import { useState } from "react";
export function ClientLogo({ src, alt, companyName, className = "h-14 w-full max-w-[158px] object-contain" }: { src: string; alt: string; companyName: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <span role="img" aria-label={alt || companyName} className="max-w-full break-words px-2 text-center text-sm font-semibold text-charcoal/60">{companyName}</span>;
  return <img src={src} alt={alt || companyName} onError={() => setFailedSrc(src)} loading="lazy" decoding="async" className={className} />;
}
