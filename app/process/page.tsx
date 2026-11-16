import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata("/process");
import { EnquiryCTA, PageHero, PageShell, SectionHeader } from "@/components/site";
import { MotionCard, ParallaxImage, SectionReveal } from "@/components/motion";
import { processSteps } from "@/lib/site-data";

export default function Page() {
  return (
    <PageShell seoPath="/process">
      <PageHero eyebrow="Process" title="A precise path from inspection to handover." text="A turnkey project needs decisions, documentation and site work to move in sequence. Matrix structures each stage so the final space is buildable, coordinated and ready for use." image="/images/matrix/process.webp" />
      <section className="bg-white px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start"><SectionHeader eyebrow="Timeline" title="Project stages with clear ownership." text="From first survey to final finishes, each stage produces the decisions needed for the next one." /></div>
          <div className="relative grid gap-5 before:absolute before:left-6 before:top-0 before:h-full before:w-px before:bg-charcoal/12">
            {processSteps.map((step, index) => <SectionReveal key={step.title} delay={index * 0.06} className="relative grid grid-cols-[48px_1fr] gap-4"><div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-gold">{String(index + 1).padStart(2, "0")}</div><MotionCard className="bg-warm p-6"><h2 className="text-xl font-semibold">{step.title}</h2><p className="mt-3 text-base leading-7 text-charcoal/66">{step.text}</p></MotionCard></SectionReveal>)}
          </div>
        </div>
      </section>
      <ParallaxImage src="/images/matrix/process.webp" alt="Project planning table and fitout site" className="min-h-[280px] sm:min-h-[440px]" strength={16} />
      <EnquiryCTA image="/images/matrix/process.webp" />
    </PageShell>
  );
}






