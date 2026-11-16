import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata("/");
import Link from "next/link";
import { ArrowRight, Compass, Hammer, Ruler, ShieldCheck } from "lucide-react";
import { services, processSteps, projects } from "@/lib/site-data";
import { EnquiryCTA, PageShell, PreviousClients, SectionHeader, TrustStrip } from "@/components/site";
import { MotionCard, MotionLinkCard, ParallaxImage, SectionReveal, StaggerItem, StaggerReveal } from "@/components/motion";

const strengths = [
  { icon: ShieldCheck, title: "Accountable delivery", text: "One team coordinates design, site execution, vendors and handover." },
  { icon: Ruler, title: "Architecture-led detailing", text: "Layouts, services, finishes and practical constraints are resolved together." },
  { icon: Hammer, title: "Turnkey execution", text: "Civil, partitions, electrical, ceiling, furniture and finishing are planned end-to-end." },
  { icon: Compass, title: "Client-first planning", text: "Every project starts with site context, usage needs and timeline clarity." },
];

export default function Home() {
  return (
    <PageShell seoPath="/">
      <section className="relative isolate min-h-[72svh] overflow-hidden sm:min-h-[80vh] bg-charcoal text-white">
        <ParallaxImage src="/images/matrix/hero-studio.webp" alt="Premium architecture and interior design studio" priority className="absolute inset-0 -z-10" imgClassName="opacity-58" strength={28} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,24,32,.96),rgba(16,24,32,.68),rgba(16,24,32,.18))]" />
        <div className="mx-auto flex min-h-[72svh] max-w-[92rem] sm:min-h-[80vh] items-end px-5 pb-16 pt-24 sm:px-6">
          <StaggerReveal className="max-w-5xl -translate-y-7 sm:-translate-y-10 lg:-translate-y-14">
            <StaggerItem><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Matrix Intertech Pvt. Ltd.</p></StaggerItem>
            <StaggerItem><h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.03] sm:text-6xl lg:text-7xl">Turnkey interiors with architectural discipline.</h1></StaggerItem>
            <StaggerItem><p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-gold sm:text-2xl">Shaping The Ideas, Building The Reality</p></StaggerItem>
            <StaggerItem><p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">Founded in 2005, Matrix Intertech creates corporate, commercial and residential spaces from concept through execution and handover.</p></StaggerItem>
            <StaggerItem className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact-us/" className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-white">Start a project <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/projects/" className="inline-flex items-center justify-center rounded-sm border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">View project types</Link>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </section>

      <TrustStrip />

      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[.78fr_1.22fr]">
          <SectionHeader eyebrow="Who we are" title="A project partner for spaces that need to look refined and work hard." text="Matrix Intertech creates interior, architecture and turnkey implementation solutions for corporate, commercial and residential spaces. Since 2005, the team has delivered projects across India with disciplined coordination from concept to handover." />
          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map(({ icon: Icon, title, text }, index) => (
              <SectionReveal key={title} delay={index * 0.05} className="h-full">
                <MotionCard className="flex h-full flex-col border border-charcoal/10 bg-white p-6">
                  <Icon className="h-7 w-7 text-bronze" />
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-charcoal/66">{text}</p>
                </MotionCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-charcoal px-5 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><SectionHeader eyebrow="Services" title="Interior, architecture and fitout expertise for real spaces." inverse /><Link href="/contact-us/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold">Plan your scope <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <SectionReveal key={service.slug} delay={index * 0.05} className="h-full">
                <MotionLinkCard href={service.href} className="group flex h-full flex-col bg-white text-charcoal">
                  <div className="relative aspect-[16/8.5] overflow-hidden"><ParallaxImage src={service.image} alt={`${service.title} interior design`} className="absolute inset-0" strength={8} /></div>
                  <div className="flex flex-1 flex-col p-7"><h3 className="text-2xl font-semibold">{service.title}</h3><p className="mt-3 text-base leading-7 text-charcoal/66">{service.summary}</p></div>
                </MotionLinkCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]"><SectionHeader eyebrow="Projects" title="Strong spaces, clearly organized around how people use them." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <SectionReveal key={project.title} delay={index * 0.05} className="h-full">
                <MotionCard className="group flex h-full flex-col overflow-hidden bg-white">
                  <div className="relative aspect-[16/8.5] overflow-hidden"><ParallaxImage src={project.image} alt={project.title} className="absolute inset-0" strength={10} /></div><div className="flex flex-1 flex-col p-7"><p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">0{index + 1}</p><h3 className="mt-3 text-2xl font-semibold">{project.title}</h3><p className="mt-3 text-base leading-7 text-charcoal/66">{project.text}</p></div>
                </MotionCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <ParallaxImage src="/images/matrix/process.webp" alt="Turnkey planning and site execution table" className="min-h-[300px] sm:min-h-[420px] lg:min-h-[460px]" strength={16} />
          <div><SectionHeader eyebrow="Process" title="A timeline built around decisions, drawings and site momentum." />
            <div className="mt-9 grid gap-5">
              {processSteps.slice(0, 4).map((step, index) => (
                <SectionReveal key={step.title} className="grid grid-cols-[56px_1fr] gap-5 border-t border-charcoal/12 pt-5" delay={index * 0.05}>
                  <div className="text-2xl font-semibold text-bronze">{String(index + 1).padStart(2, "0")}</div><div><h3 className="text-xl font-semibold">{step.title}</h3><p className="mt-2 text-base leading-7 text-charcoal/66">{step.text}</p></div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PreviousClients />


      <EnquiryCTA />
    </PageShell>
  );
}



