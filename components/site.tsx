import type { RoutePath } from "@/lib/seo";
import { SeoContent } from "@/components/seo-content";
import { publicClients } from "@/lib/portfolio";
import { ClientLogo } from "@/components/client-logo";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Mail, Phone } from "lucide-react";
import { aboutItems, contact, navItems, services, trustItems } from "@/lib/site-data";
import { ParallaxImage, SectionReveal } from "@/components/motion";
import { SiteEffects } from "@/components/site-effects";
import { SiteHeader } from "@/components/site-header";

const isoCertificatePath = "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-9001-FINAL-COPY-BCI-150105QMS-.pdf";

export function PageShell({ children, seoPath }: { children: React.ReactNode; seoPath?: RoutePath }) {
  return (
    <div className="min-h-screen bg-warm text-charcoal">
      <SiteHeader />
      <SiteEffects />
      <main>{children}{seoPath && <SeoContent path={seoPath} />}</main>
      <footer className="site-footer bg-charcoal text-white">
        <div className="mx-auto grid max-w-[92rem] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.25fr_.6fr_.6fr_.6fr]">
          <div>
            <img width={450} height={135} src="/images/matrix/logo_dark.png" alt="Matrix Intertech logo" loading="lazy" decoding="async" className="h-14 w-auto max-w-[240px] object-contain" />
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">Interior, architecture and turnkey implementation for corporate, residential and commercial projects.</p>
            <a href={isoCertificatePath} target="_blank" rel="noreferrer" className="mt-5 inline-flex max-w-sm items-center gap-3 rounded-sm border border-white/12 bg-white/6 px-4 py-3 text-left transition hover:border-gold/60 hover:bg-white/10" aria-label="View ISO 9001 certificate PDF">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-gold text-charcoal"><BadgeCheck className="h-5 w-5" aria-hidden="true" /></span>
              <span>
                <span className="block text-sm font-semibold text-white">ISO Certified Company</span>
                <span className="mt-1 block text-sm leading-5 text-white/62">Quality-led interiors, architecture and turnkey execution.</span>
              </span>
            </a>
            <div className="mt-6 flex flex-col gap-3 text-base text-white/70 sm:flex-row sm:gap-6">
              <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> {contact.phone}</span>
              <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> {contact.email}</span>
            </div>
          </div>
          <FooterColumn title="About Us" items={aboutItems} />
          <FooterColumn title="Routes" items={navItems} />
          <FooterColumn title="Services" items={services.map((s) => ({ href: s.href, label: s.title }))} />
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-white/50">© 2005-2026 Matrix Intertech Pvt. Ltd. All rights reserved.</div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return <div><h3 className="text-base font-semibold text-gold">{title}</h3><div className="mt-4 grid gap-2">{items.map((item) => <Link prefetch={false} key={item.href} href={item.href} className="text-base text-white/70 hover:text-white">{item.label}</Link>)}</div></div>;
}

export function SectionHeader({ eyebrow, title, text, inverse = false }: { eyebrow: string; title: string; text?: string; inverse?: boolean }) {
  return (
    <SectionReveal>
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">{eyebrow}</p>
        <h2 className={`mt-3 max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl ${inverse ? "text-white" : "text-charcoal"}`}>{title}</h2>
        {text ? <p className={`mt-5 max-w-2xl text-lg leading-8 ${inverse ? "text-white/68" : "text-charcoal/68"}`}>{text}</p> : null}
      </div>
    </SectionReveal>
  );
}

export function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: string; text: string; image: string }) {
  return (
    <section className="relative isolate min-h-[56svh] overflow-hidden bg-charcoal px-5 py-20 sm:min-h-[62vh] sm:py-24 text-white sm:px-6">
      <ParallaxImage src={image} alt="" priority className="absolute inset-0 -z-10" imgClassName="opacity-50" strength={30} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,24,32,.96),rgba(16,24,32,.72),rgba(16,24,32,.18))]" />
      <div className="mx-auto flex min-h-[38vh] max-w-[92rem] items-end sm:min-h-[44vh]">
        <SectionReveal className="max-w-4xl pb-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/76">{text}</p>
        </SectionReveal>
      </div>
    </section>
  );
}

export function TrustStrip() {
  return <section className="border-y border-charcoal/10 bg-white/55"><div className="mx-auto grid max-w-[92rem] grid-cols-2 gap-x-5 gap-y-6 px-5 py-7 sm:px-6 sm:grid-cols-4">{trustItems.map((item, index) => <SectionReveal key={item.value} className="min-w-0 break-words" delay={index * 0.06}><div><div className="text-xl font-semibold text-charcoal">{item.value}</div><div className="mt-1 text-sm text-charcoal/58">{item.label}</div></div></SectionReveal>)}</div></section>;
}


export async function PreviousClients({ title = "Trusted by leading brands across India." }: { title?: string } = {}) {
  const clients = await publicClients();
  if (!clients.length) return null;
  return (
    <section className="bg-warm px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[92rem]">
        <SectionReveal className="mx-auto max-w-4xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">Previous clients</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] text-charcoal sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-charcoal/68 sm:text-lg sm:leading-8">
            Matrix Intertech has delivered interior, fit-out and project execution work for clients across aviation, banking, media, retail, hospitality, technology and infrastructure.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-charcoal/62">
            These associations reflect long-term trust, coordination discipline and consistent delivery across demanding project environments.
          </p>
        </SectionReveal>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {clients.map((client, index) => (
            <SectionReveal key={client.id} delay={index * 0.025} className="h-full w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]">
              <div className="group flex h-[100px] w-full items-center justify-center border border-charcoal/10 bg-white px-4 py-3 text-center shadow-[0_18px_45px_rgba(16,24,32,.05)] transition hover:-translate-y-0.5 hover:border-bronze/40 hover:shadow-[0_24px_60px_rgba(16,24,32,.08)]">
                <ClientLogo src={client.logoUrl} alt={client.logoAlt} companyName={client.companyName} className="h-14 w-full max-w-[158px] object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function EnquiryCTA({ image = "/images/matrix/contact.webp" }: { image?: string }) {
  return (
    <section className="bg-charcoal px-5 py-14 text-white sm:py-18 sm:px-6">
      <SectionReveal className="mx-auto grid max-w-[92rem] overflow-hidden rounded-sm border border-white/10 bg-white/5 lg:grid-cols-[.9fr_1.1fr]">
        <ParallaxImage src={image} alt="" className="min-h-[240px] sm:min-h-[320px]" strength={16} />
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">Project enquiry</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.1] sm:text-5xl">Bring us the site, scope and timeline.</h2>
          <p className="mt-4 text-base leading-7 text-white/72">Matrix can help shape a clear path from first inspection to handover across interiors, architecture and turnkey fitout work.</p>
          <Link prefetch={false} href="/contact-us/" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-white">Start a conversation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </SectionReveal>
    </section>
  );
}
















