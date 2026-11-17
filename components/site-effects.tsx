"use client";

import { useEffect } from "react";

// One observer and one scroll listener; content remains server-rendered and visible without JS.
export function SiteEffects() {
  useEffect(() => {
    const setLogoFallback = (image: HTMLImageElement, failed: boolean) => {
      const fallback = image.closest("[data-client-logo]")?.querySelector<HTMLElement>("[data-logo-fallback]");
      if (fallback) { image.hidden = failed; fallback.hidden = !failed; }
    };
    const onImageError = (event: Event) => {
      if (event.target instanceof HTMLImageElement && event.target.hasAttribute("data-logo-image")) setLogoFallback(event.target, true);
    };
    const onImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement && event.target.hasAttribute("data-logo-image")) setLogoFallback(event.target, false);
    };
    document.addEventListener("error", onImageError, true);
    document.addEventListener("load", onImageLoad, true);
    document.querySelectorAll<HTMLImageElement>("[data-logo-image]").forEach(image => {
      if (image.complete) setLogoFallback(image, !image.naturalWidth);
    });
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    let started = false;
    let userScrolled = false;
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
      // Finish every layout read before marking any below-fold element pending.
      const belowFold = [...reveals].filter(el => el.getBoundingClientRect().top >= innerHeight);
      belowFold.forEach(el => {
        el.dataset.revealState = "pending";
        observer.observe(el);
      });
      const layers = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
      const desktop = matchMedia("(min-width: 1024px)");
      let frame = 0;
      let interacted = false;
      const update = () => {
        frame = 0;
        if (!desktop.matches) return;
        // All geometry is read as one batch, then all styles are written.
        const positions = layers.map(el => ({ el, rect: el.getBoundingClientRect() }));
        for (const { el, rect: r } of positions) {
          if (r.bottom < -100 || r.top > innerHeight + 100) continue;
          const progress = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
          const strength = Number(el.dataset.parallax);
          el.style.setProperty("--parallax-y", `${(progress * 2 - 1) * strength}px`);
          el.style.setProperty("--parallax-scale", String(1.05 + progress * .07));
        }
      };
      const schedule = () => { if (desktop.matches && !frame) frame = requestAnimationFrame(update); };
      const onScroll = () => { interacted = true; userScrolled = true; schedule(); };
      const onResize = () => { if (interacted) schedule(); };
      const onBreakpoint = () => {
        if (desktop.matches) { if (interacted) schedule(); }
        else layers.forEach(el => { el.style.removeProperty("--parallax-y"); el.style.removeProperty("--parallax-scale"); });
      };
      // No initial parallax measurement or write during hydration.
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onResize, { passive: true });
      desktop.addEventListener("change", onBreakpoint);
      if (userScrolled) { interacted = true; schedule(); }
      cleanup = () => {
        observer.disconnect(); cancelAnimationFrame(frame);
        removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
        desktop.removeEventListener("change", onBreakpoint);
        reveals.forEach(el => delete el.dataset.revealState);
        layers.forEach(el => { el.style.removeProperty("--parallax-y"); el.style.removeProperty("--parallax-scale"); });
      };
    };
    // Do not scan below-fold geometry while the hero is being painted/hydrated.
    const triggers = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
    const start = (event: Event) => {
      if (started) return;
      started = true;
      userScrolled = event.type === "scroll";
      triggers.forEach(type => removeEventListener(type, start));
      setup();
    };
    const onMotionChange = () => { if (started) setup(); };
    triggers.forEach(type => addEventListener(type, start, { passive: true }));
    media.addEventListener("change", onMotionChange);
    return () => { cleanup(); triggers.forEach(type => removeEventListener(type, start)); media.removeEventListener("change", onMotionChange); document.removeEventListener("error", onImageError, true); document.removeEventListener("load", onImageLoad, true); };
  }, []);
  return null;
}
