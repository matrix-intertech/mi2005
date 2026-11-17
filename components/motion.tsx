import imageDimensions from "@/lib/image-dimensions.json";
import responsiveImages from "@/lib/responsive-images.json";
import type React from "react";

type ParallaxImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "className" | "src"> & {
  src: string; className?: string; imgClassName?: string; strength?: number; priority?: boolean;
};
type RevealProps = { children: React.ReactNode; className?: string; delay?: number };

export function SectionReveal({ children, className = "", delay = 0 }: RevealProps) {
  return <div className={className} data-reveal style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}>{children}</div>;
}
export function StaggerReveal({ children, className = "" }: RevealProps) {
  return <div className={`${className} stagger-reveal`}>{children}</div>;
}
export function StaggerItem({ children, className = "" }: RevealProps) {
  return <div className={className}>{children}</div>;
}
export function MotionCard({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <article {...props} className={`motion-card ${className}`} />;
}
export function MotionLinkCard({ className = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} className={`motion-card ${className}`} />;
}
export function ParallaxImage({ className = "", imgClassName = "", strength = 44, priority, src, alt = "", sizes, ...props }: ParallaxImageProps) {
  const variants = responsiveImages[src as keyof typeof responsiveImages];
  const dimensions = imageDimensions[src as keyof typeof imageDimensions];
  const hero = imgClassName.includes("home-hero-image");
  // Object-cover needs enough pixels for the rendered height as well as its width.
  const aspect = dimensions ? dimensions.width / dimensions.height : 2;
  const imageSizes = sizes || (priority ? (hero ? "max(112vw, 210vh)" : `(max-width: 639px) max(112vw, ${Math.ceil(63 * aspect)}svh, ${Math.ceil(600 * aspect)}px), max(112vw, ${Math.ceil(70 * aspect)}vh)`) : "(max-width: 639px) 100vw, (max-width: 1023px) 75vw, 50vw");
  const srcSet = (format: string, group: "variants" | "mobile" | "mobileWide" | "tablet" = "variants") => variants?.[group]?.filter(v => v.format === format).map(v => `${v.src} ${v.width}w`).join(", ");
  return <>
    {hero && priority && <>
      <link rel="preload" as="image" type="image/avif" media="(max-width: 480px)" imageSrcSet={srcSet("avif", "mobile")} imageSizes="100vw" fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media="(480px < width < 640px)" imageSrcSet={srcSet("avif", "mobileWide")} imageSizes="960px" fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media="(640px <= width < 1024px) and (orientation: portrait)" imageSrcSet={srcSet("avif", "tablet")} imageSizes="960px" fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media="(width >= 1024px), (width >= 640px) and (orientation: landscape)" imageSrcSet={srcSet("avif")} imageSizes={imageSizes} fetchPriority="high" />
    </>}
    <div className={`overflow-hidden bg-charcoal ${className.includes("absolute") ? className : `relative ${className}`}`} data-parallax={strength}>
    <div className="parallax-layer absolute inset-0">
      <picture>
        {hero && <>
          <source media="(max-width: 480px)" type="image/avif" srcSet={srcSet("avif", "mobile")} sizes="100vw" />
          <source media="(max-width: 480px)" type="image/webp" srcSet={srcSet("webp", "mobile")} sizes="100vw" />
          <source media="(480px < width < 640px)" type="image/avif" srcSet={srcSet("avif", "mobileWide")} sizes="960px" />
          <source media="(480px < width < 640px)" type="image/webp" srcSet={srcSet("webp", "mobileWide")} sizes="960px" />
          <source media="(640px <= width < 1024px) and (orientation: portrait)" type="image/avif" srcSet={srcSet("avif", "tablet")} sizes="960px" />
          <source media="(640px <= width < 1024px) and (orientation: portrait)" type="image/webp" srcSet={srcSet("webp", "tablet")} sizes="960px" />
        </>}
        {variants && <>
          <source type="image/avif" srcSet={srcSet("avif")} sizes={imageSizes} />
          <source type="image/webp" srcSet={srcSet("webp")} sizes={imageSizes} />
        </>}
        {/* Native picture keeps responsive selection discoverable in server HTML. */}
        <img {...props} src={src} alt={alt} aria-hidden={alt === "" ? true : undefined}
          width={props.width ?? dimensions?.width} height={props.height ?? dimensions?.height}
          loading={priority ? "eager" : props.loading || "lazy"} fetchPriority={priority ? "high" : props.fetchPriority}
          decoding="async" className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`} />
      </picture>
    </div>
  </div></>;
}
