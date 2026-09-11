import type { Metadata } from "next";
import { Building2, CheckCircle2, Clock3, ExternalLink, FileText, MapPinned, Ruler, Wrench } from "lucide-react";
import { EnquiryCTA, PageHero, PageShell, SectionHeader } from "@/components/site";
import { SectionReveal } from "@/components/motion";
import { contact } from "@/lib/site-data";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/company-factsheet");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };

const stats = [
  { value: "2005", label: "Founded" },
  { value: "20+", label: "Years of experience" },
  { value: "500+", label: "Commercial projects delivered" },
  { value: "Pan India", label: "Execution capability" },
];

const capabilities = [
  { icon: Building2, title: "Turnkey interiors", text: "Complete interior solutions from concept and detailing through execution and handover." },
  { icon: Wrench, title: "Maintenance and upgrades", text: "Repair, refurbishment and planned maintenance for commercial and residential spaces." },
  { icon: Ruler, title: "Space planning", text: "Architecture-led layouts, finish coordination and practical planning for real-world use." },
  { icon: Clock3, title: "Delivery management", text: "Timeline-aware coordination across teams, vendors, services and site activity." },
];

const sectors = ["Banking", "Corporate offices", "Retail", "Aviation", "Hospitality", "Residential", "Commercial"];

export default function Page() {
  return (
    <PageShell>
      <PageHero eyebrow="Company factsheet" title="Matrix Intertech at a glance." text="A New Delhi based interior and architectural services company specializing in turnkey interiors, maintenance, space planning and complete project delivery." image="/images/matrix/process.webp" />
      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, index) => (
              <SectionReveal key={item.label} delay={index * 0.05}>
                <div className="border border-charcoal/10 bg-white p-6">
                  <p className="text-3xl font-semibold text-bronze">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold text-charcoal/64">{item.label}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <SectionHeader eyebrow="Capability summary" title="Interior, architecture and turnkey execution under one roof." text="Matrix supports clients with turnkey interiors, maintenance, space planning and site delivery across commercial, residential and institutional environments." />
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, text }, index) => (
              <SectionReveal key={title} delay={index * 0.05}>
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
      <section className="bg-charcoal px-5 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeader eyebrow="Sectors" title="Built for varied project environments." text="Matrix works across banking, corporate offices, retail, aviation, hospitality, residential and commercial spaces." inverse />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {sectors.map((sector) => <div key={sector} className="flex items-center gap-3 border border-white/12 bg-white/6 p-4"><CheckCircle2 className="h-5 w-5 text-gold" /><span className="text-sm font-semibold text-white/78">{sector}</span></div>)}
            </div>
          </div>
          <div className="border border-white/12 bg-white/6 p-7 sm:p-9">
            <MapPinned className="h-8 w-8 text-gold" />
            <h2 className="mt-5 text-3xl font-semibold">Company and contact details</h2>
            <div className="mt-6 grid gap-4 text-base leading-7 text-white/72">
              <p><span className="font-semibold text-white">Base:</span> Delhi / New Delhi</p>
              <p><span className="font-semibold text-white">Office:</span> {contact.address}</p>
              <p><span className="font-semibold text-white">Phone:</span> {contact.phone}</p>
              <p><span className="font-semibold text-white">Email:</span> Sales@matrixonline.in</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <SectionHeader eyebrow="Certifications" title="Compliance documents available for review." text="Matrix keeps its company credentials accessible for clients reviewing quality systems, environmental management, safety practices and registration documentation." />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["GST Registration Certificate", "/images/matrix/PDF/8.B.GST-Certificate.pdf"],
              ["ISO 14001 Environmental Management", "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-14001-final-150106EMS.pdf"],
              ["ISO 45001 Occupational Health and Safety", "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-45001-FINAL-COPY-BCI-150107OSHASH-.pdf"],
              ["ISO 9001 Quality Management", "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-9001-FINAL-COPY-BCI-150105QMS-.pdf"],
            ].map(([title, file], index) => (
              <SectionReveal key={file} delay={index * 0.04}>
                <a href={file} target="_blank" rel="noreferrer" className="flex h-full items-center gap-4 border border-charcoal/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-bronze/40">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-charcoal text-gold"><FileText className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-charcoal/78">{title}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-bronze" aria-hidden="true" />
                </a>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <EnquiryCTA />
    </PageShell>
  );
}

