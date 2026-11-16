"use client";

import imageDimensions from "@/lib/image-dimensions.json";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

type ParallaxImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "className" | "src"> & {
  src: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  priority?: boolean;
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  if (!mounted || reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.75, ease, delay }}>
      {children}
    </motion.div>
  );
}

export function StaggerReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  if (!mounted || reduceMotion) return <div className={className}>{children}</div>;
  return <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } } }}>{children}</motion.div>;
}

export function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  if (!mounted || reduceMotion) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.72, ease } } }}>{children}</motion.div>;
}

export function MotionCard(props: HTMLMotionProps<"article">) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  if (!mounted || reduceMotion) return <article {...(props as React.HTMLAttributes<HTMLElement>)} />;
  return <motion.article {...props} whileHover={{ y: -6 }} transition={{ duration: 0.35, ease }} />;
}

export function MotionLinkCard(props: HTMLMotionProps<"a">) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  if (!mounted || reduceMotion) return <a {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  return <motion.a {...props} whileHover={{ y: -6 }} transition={{ duration: 0.35, ease }} />;
}

function ImageLayer({ src, alt = "", imgClassName = "", priority, onError, ...props }: ParallaxImageProps & { onError: () => void }) {
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      width={props.width ?? imageDimensions[src as keyof typeof imageDimensions]?.width}
      height={props.height ?? imageDimensions[src as keyof typeof imageDimensions]?.height}
      loading={priority ? "eager" : props.loading || "lazy"}
      fetchPriority={priority ? "high" : props.fetchPriority}
      decoding="async"
      onError={onError}
      className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
    />
  );
}

function ImageFallback() {
  return <div className="absolute inset-0 bg-[linear-gradient(135deg,#101820,#2f2822_52%,#b08a58)] opacity-85" aria-hidden="true" />;
}

export function ParallaxImage({ className = "", imgClassName = "", strength = 44, ...props }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const wrapperClassName = `overflow-hidden bg-charcoal ${className.includes("absolute") ? className : `relative ${className}`}`;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.12]);

  if (!mounted || reduceMotion) {
    return (
      <div ref={ref} className={wrapperClassName}>
        {failed ? <ImageFallback /> : <ImageLayer {...props} imgClassName={imgClassName} onError={() => setFailed(true)} />}
      </div>
    );
  }

  return (
    <div ref={ref} className={wrapperClassName}>
      {failed ? <ImageFallback /> : (
        <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
          <ImageLayer {...props} imgClassName={imgClassName} onError={() => setFailed(true)} />
        </motion.div>
      )}
    </div>
  );
}



