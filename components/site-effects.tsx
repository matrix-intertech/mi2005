"use client";

import { useEffect } from "react";

// One observer and one scroll listener; content remains server-rendered and visible without JS.
export function SiteEffects() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      if (media.matches) return;
      const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]");
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealState = "visible";
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -12% 0px" });
      reveals.forEach(el => {
        // Never hide content that the visitor has already seen, including the LCP element.
        if (el.getBoundingClientRect().top >= innerHeight) {
          el.dataset.revealState = "pending";
          observer.observe(el);
        }
      });
      const layers = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
      let frame = 0;
      const update = () => {
        frame = 0;
        for (const el of layers) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -100 || r.top > innerHeight + 100) continue;
          const progress = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
          const strength = Number(el.dataset.parallax);
          el.style.setProperty("--parallax-y", `${(progress * 2 - 1) * strength}px`);
          el.style.setProperty("--parallax-scale", String(1.05 + progress * .07));
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      schedule();
      addEventListener("scroll", schedule, { passive: true });
      addEventListener("resize", schedule, { passive: true });
      cleanup = () => {
        observer.disconnect(); cancelAnimationFrame(frame);
        removeEventListener("scroll", schedule); removeEventListener("resize", schedule);
        reveals.forEach(el => delete el.dataset.revealState);
        layers.forEach(el => { el.style.removeProperty("--parallax-y"); el.style.removeProperty("--parallax-scale"); });
      };
    };
    setup(); media.addEventListener("change", setup);
    return () => { cleanup(); media.removeEventListener("change", setup); };
  }, []);
  return null;
}
