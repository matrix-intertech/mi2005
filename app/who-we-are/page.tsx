import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock3, Compass, Download, ExternalLink, FileText, Handshake, Layers3, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { EnquiryCTA, PageHero, PageShell, PreviousClients, SectionHeader, TrustStrip } from "@/components/site";
import { ParallaxImage, SectionReveal } from "@/components/motion";
import { contact, projects, services } from "@/lib/site-data";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/who-we-are");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };

const capabilityStats = [
  { value: "2005", label: "Founded in Delhi" },
  { value: "20+", label: "Years of delivery experience" },
  { value: "500+", label: "Commercial projects delivered" },
  { value: "Pan-India", label: "Execution capability" },
];

const sectors = ["Corporate offices", "Banks", "Residences", "Hotels", "Showrooms", "Restaurants", "Group housing", "Apartments"];

const strengths = [
  { icon: ShieldCheck, title: "Professional accountability", text: "One experienced team stays responsible for coordination, decisions, site progress and handover quality." },
  { icon: Layers3, title: "Concept-to-complete scope", text: "Planning, architecture inputs, interiors, services, procurement and execution are handled as one connected workflow." },
  { icon: Clock3, title: "Timely, hassle-free delivery", text: "Matrix is structured around practical scheduling, clear responsibilities and reduced pressure for clients during execution." },
  { icon: Sparkles, title: "Technology-led detailing", text: "Current tools, technical drawings and disciplined documentation help convert design intent into buildable site instructions." },
];


const certifications = [
  {
    title: "GST Registration Certificate",
    file: "/images/matrix/PDF/8.B.GST-Certificate.pdf",
    description: "Registration documentation supporting compliant commercial operations.",
    type: "PDF",
  },
  {
    title: "ISO 14001 Environmental Management",
    file: "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-14001-final-150106EMS.pdf",
    description: "Environmental management certification aligned with responsible project practices.",
    type: "PDF",
  },
  {
    title: "ISO 45001 Occupational Health and Safety",
    file: "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-45001-FINAL-COPY-BCI-150107OSHASH-.pdf",
    description: "Health and safety certification supporting disciplined site execution.",
    type: "PDF",
  },
  {
    title: "ISO 9001 Quality Management",
    file: "/images/matrix/PDF/MATRIX-INTERTECH-PRIVATE-LIMITED-ISO-9001-FINAL-COPY-BCI-150105QMS-.pdf",
    description: "Quality management certification supporting process-led delivery and handover.",
    type: "PDF",
  },
];

const deliverySteps = [
  "Site inspection and project understanding",
  "Concept development, sketches and design direction",
  "Detailed drawings, services coordination and estimates",
  "Civil, electrical, partitions, ceiling, finishes and fit-out execution",
  "Final checks, closeout and handover",
];

export default function Page() {
  return <AboutPage />;
}

export function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Who we are"
        title="About Matrix Intertech"
        text="A Delhi-based interior and architectural services company delivering turnkey spaces from concept to complete implementation under one roof."
        image="/images/matrix/hero-studio.webp"
      />
      <TrustStrip />

      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Company story"
              title="Built for clients who want refined spaces without fragmented execution."
              text="Founded in 2005, Matrix Intertech has grown as an integrated interiors, architecture and turnkey implementation partner based in New Delhi. The company brings design thinking, site discipline and project management together so clients have a single accountable team from the first brief to final handover."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {capabilityStats.map((item, index) => (
                <SectionReveal key={item.label} delay={index * 0.05}>
                  <div className="border border-charcoal/10 bg-white p-6">
                    <p className="text-3xl font-semibold text-bronze">{item.value}</p>
                    <p className="mt-2 text-sm font-semibold text-charcoal/64">{item.label}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
          <ParallaxImage src="/images/matrix/process.webp" alt="Matrix Intertech turnkey planning and site execution" className="min-h-[340px] sm:min-h-[460px]" strength={18} />
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <SectionHeader
            eyebrow="What we do"
            title="Complete interior solutions for commercial, residential and hospitality environments."
            text="Matrix designs, executes, manages and delivers spaces that need both visual polish and practical performance. The team works across corporate offices, banks, residences, hotels, showrooms, restaurants, group housing and apartments."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service, index) => (
              <SectionReveal key={service.slug} delay={index * 0.05}>
                <Link href={service.href} className="group block h-full border border-charcoal/10 bg-warm p-6 transition hover:-translate-y-0.5 hover:border-bronze/40 hover:bg-white">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 text-2xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-base leading-7 text-charcoal/66">{service.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-charcoal group-hover:text-bronze">Explore service <ArrowRight className="h-4 w-4" /></span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-5 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Turnkey delivery model"
              title="One roof for design, execution, management and delivery."
              text="Matrix takes the pressure out of interior projects by owning the full sequence: understanding the site, shaping the concept, developing drawings and estimates, coordinating specialist work and completing the final finish."
              inverse
            />
            <div className="mt-8 grid gap-3">
              {deliverySteps.map((step, index) => (
                <SectionReveal key={step} delay={index * 0.04} className="flex gap-4 border-t border-white/12 pt-4">
                  <span className="text-lg font-semibold text-gold">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-base leading-7 text-white/72">{step}</p>
                </SectionReveal>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map(({ icon: Icon, title, text }, index) => (
              <SectionReveal key={title} delay={index * 0.05} className="h-full">
                <div className="h-full border border-white/12 bg-white/6 p-6">
                  <Icon className="h-7 w-7 text-gold" />
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-white/68">{text}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <SectionHeader eyebrow="Sectors served" title="A delivery partner for varied project environments." text="The same integrated approach adapts across workplace, retail, hospitality, housing and private residential briefs." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {sectors.map((sector, index) => (
                <SectionReveal key={sector} delay={index * 0.035}>
                  <div className="flex h-full items-center gap-3 border border-charcoal/10 bg-white p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-bronze" />
                    <span className="text-sm font-semibold text-charcoal/78">{sector}</span>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="What makes us special" title="Experienced people, current technology and delivery ownership." text="Matrix combines professional project conduct with a team of specialists who understand design, detailing, site realities and client communication. The result is a smoother path from imagination to completed space." />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[{ icon: Compass, title: "Clear direction" }, { icon: Handshake, title: "Trustworthy teams" }, { icon: Building2, title: "Built outcomes" }].map(({ icon: Icon, title }, index) => (
                <SectionReveal key={title} delay={index * 0.05}>
                  <div className="border border-charcoal/10 bg-warm p-5">
                    <Icon className="h-6 w-6 text-bronze" />
                    <p className="mt-4 text-lg font-semibold">{title}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
          <div className="border border-charcoal/10 bg-charcoal p-7 text-white sm:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">Company profile</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight">Interior designing, architecture and turnkey projects.</h3>
            <div className="mt-7 grid gap-5 text-base leading-7 text-white/72">
              <p><span className="font-semibold text-white">Office:</span> {contact.address}</p>
              <p><span className="font-semibold text-white">Phone:</span> {contact.phone}</p>
              <p><span className="font-semibold text-white">Email:</span> Sales@matrixonline.in</p>
              <p><span className="font-semibold text-white">Base:</span> New Delhi, with pan-India project capability.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-5 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="CERTIFICATIONS"
              title="Certifications that support accountable delivery."
              text="Matrix backs its turnkey delivery model with documentation that reflects quality systems, process discipline, responsible operations and compliance-minded site execution."
              inverse
            />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {certifications.map((item, index) => (
              <SectionReveal key={item.file} delay={index * 0.05} className="h-full">
                <article className="flex h-full flex-col border border-white/12 bg-white/6 p-6 transition hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/9">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-gold text-charcoal">
                      <FileText className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">{item.type}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-3 flex-1 text-base leading-7 text-white/68">{item.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={item.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-white/18 px-3 py-2 text-sm font-semibold text-white transition hover:border-gold hover:text-gold">
                      View PDF <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <a href={item.file} download className="inline-flex items-center gap-2 rounded-sm bg-gold px-3 py-2 text-sm font-semibold text-charcoal transition hover:bg-white">
                      Download <Download className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <SectionHeader eyebrow="Project capability" title="Spaces shaped around operations, presentation and handover readiness." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <SectionReveal key={project.title} delay={index * 0.05}>
                <div className="h-full border border-charcoal/10 bg-white p-6">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-semibold">{project.title}</h3>
                  <p className="mt-3 text-base leading-7 text-charcoal/66">{project.text}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <PreviousClients />
      <EnquiryCTA />
    </PageShell>
  );
}

