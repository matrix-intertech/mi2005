"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { aboutItems, navItems } from "@/lib/site-data";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);
  useEffect(() => scrollY.on("change", (latest) => setScrolled(latest > 16)), [scrollY]);

  const headerClass = "sticky top-0 z-50 border-b bg-warm/90 backdrop-blur-xl";
  const headerStyle = mounted && scrolled ? { borderColor: "rgba(16,24,32,.14)", boxShadow: "0 18px 45px rgba(16,24,32,.10)" } : { borderColor: "rgba(16,24,32,.08)", boxShadow: "0 0 0 rgba(16,24,32,0)" };
  const content = <HeaderContent />;

  if (!mounted || reduceMotion) return <header className={headerClass} style={headerStyle}>{content}</header>;
  return <motion.header className={headerClass} animate={headerStyle} transition={{ duration: 0.28 }}>{content}</motion.header>;
}

function HeaderContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
      <Link href="/" className="flex min-w-0 items-center" aria-label="Matrix Intertech home">
        <img src="/images/matrix/logo.png" alt="Matrix Intertech logo" className="h-10 w-auto max-w-[190px] object-contain sm:h-10" />
      </Link>
      <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
        {navItems.slice(0, 1).map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-charcoal/75 transition hover:text-bronze">{item.label}</Link>)}
        <div className="group relative" onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal/75 transition hover:text-bronze focus:outline-none focus:ring-4 focus:ring-bronze/20"
            aria-expanded={aboutOpen}
            aria-haspopup="menu"
            onClick={() => setAboutOpen((value) => !value)}
          >
            About Us <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className={`absolute left-0 top-full w-56 pt-4 ${aboutOpen ? "block" : "hidden group-hover:block group-focus-within:block"}`} role="menu">
            <div className="grid gap-1 rounded-sm border border-charcoal/10 bg-warm p-3 shadow-2xl">
              {aboutItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-sm px-3 py-2 text-sm font-medium text-charcoal/75 hover:bg-white hover:text-bronze focus:bg-white focus:outline-none" role="menuitem">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {navItems.slice(1).map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-charcoal/75 transition hover:text-bronze">{item.label}</Link>)}
      </nav>
      <Link href="/contact-us" className="hidden rounded-sm bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze sm:inline-flex">Start enquiry</Link>
      <details className="relative lg:hidden" open={mobileOpen} onToggle={(event) => setMobileOpen(event.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center rounded-sm border border-charcoal/15 p-2 focus:outline-none focus:ring-4 focus:ring-bronze/20" aria-controls="mobile-navigation" aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </summary>
        <nav id="mobile-navigation" className="absolute right-0 mt-3 grid w-72 gap-1 rounded-sm border border-charcoal/10 bg-warm p-3 shadow-2xl" aria-label="Mobile navigation">
          {navItems.slice(0, 1).map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm font-medium hover:bg-white focus:outline-none focus:ring-4 focus:ring-bronze/20">{item.label}</Link>)}
          <details className="rounded-sm px-3 py-2" open={aboutOpen} onToggle={(event) => setAboutOpen(event.currentTarget.open)}>
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium" aria-expanded={aboutOpen} aria-label="About Us links">
              About Us <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </summary>
            <div className="mt-2 grid gap-1 border-l border-charcoal/10 pl-3">
              {aboutItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-charcoal/70 hover:bg-white focus:outline-none focus:ring-4 focus:ring-bronze/20">{item.label}</Link>)}
            </div>
          </details>
          {navItems.slice(1).map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm font-medium hover:bg-white focus:outline-none focus:ring-4 focus:ring-bronze/20">{item.label}</Link>)}
        </nav>
      </details>
    </div>
  );
}

