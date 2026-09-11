import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Handshake, ShieldCheck } from "lucide-react";
import { EnquiryCTA, PageHero, PageShell, PreviousClients, SectionHeader } from "@/components/site";
import { SectionReveal } from "@/components/motion";
import { previousClients } from "@/lib/site-data";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/clients");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };

const trustNotes = [
  { icon: Building2, title: "Multi-sector delivery", text: "Experience across banking, aviation, media, retail, infrastructure, technology and hospitality environments." },
  { icon: ShieldCheck, title: "Execution confidence", text: "Clients rely on Matrix for coordinated interiors, fit-out work and project execution support." },
  { icon: Handshake, title: "Long-term trust", text: "The portfolio reflects relationships built through practical planning, quality work and dependable handover." },
];

export default function Page() {
  return (
    <PageShell>
      <PageHero eyebrow="Our clients" title="Trusted by leading brands across India." text="Matrix Intertech has delivered interior, fit-out and turnkey execution work for organizations across banking, aviation, media, retail, infrastructure, hospitality and corporate sectors." image="/images/matrix/projects-office.webp" />
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHeader eyebrow="Client portfolio" title="A track record shaped by demanding project environments." text="From customer-facing locations to operational workplaces, Matrix brings a single accountable team for design coordination, site execution and handover readiness." />
          <div className="grid gap-4 sm:grid-cols-3">
            {trustNotes.map(({ icon: Icon, title, text }, index) => (
              <SectionReveal key={title} delay={index * 0.05} className="h-full">
                <div className="h-full border border-charcoal/10 bg-warm p-6">
                  <Icon className="h-7 w-7 text-bronze" />
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-charcoal/66">{text}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
      <PreviousClients />
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Logo index" title="Client associations represented in the Matrix portfolio." />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previousClients.map((client, index) => (
              <SectionReveal key={client.name} delay={index * 0.025}>
                <div className="flex h-28 items-center justify-center border border-charcoal/10 bg-warm px-5">
                  <img src={client.logo} alt={`${client.name} logo`} className="h-14 w-full max-w-[160px] object-contain opacity-85 grayscale" loading="lazy" decoding="async" />
                </div>
              </SectionReveal>
            ))}
          </div>
          <Link href="/contact-us/" className="mt-10 inline-flex items-center gap-2 rounded-sm bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-bronze">Discuss a project <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
      <EnquiryCTA />
    </PageShell>
  );
}

