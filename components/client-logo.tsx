export function ClientLogo({ src, alt, companyName, className = "h-14 w-full max-w-[158px] object-contain" }: { src: string; alt: string; companyName: string; className?: string }) {
  const fallback = <span data-logo-fallback hidden={Boolean(src)} role="img" aria-label={alt || companyName} className="max-w-full break-words px-2 text-center text-sm font-semibold text-charcoal/60">{companyName}</span>;
  if (!src) return fallback;
  return <span className="contents" data-client-logo>
    <img data-logo-image width={158} height={56} src={src} alt={alt || companyName} loading="lazy" decoding="async" className={className} />
    {fallback}
  </span>;
}
