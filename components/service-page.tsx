import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { EnquiryCTA, PageHero, PageShell, SectionHeader } from "@/components/site";
import { MotionCard, ParallaxImage, SectionReveal } from "@/components/motion";
import { services } from "@/lib/site-data";

export function ServicePage({ slug }: { slug: string }) {
  const service = services.find((item) => item.slug === slug)!;
  return (
    <PageShell>
      <PageHero eyebrow="Service" title={service.title} text={service.summary} image={service.image} />
      <section className="bg-warm px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.98fr_1.02fr] lg:items-center">
          <ParallaxImage src={service.image} alt="" className="min-h-[280px] sm:min-h-[420px] lg:min-h-[460px]" strength={16} />
          <div>
            <SectionHeader eyebrow="Scope" title={`A complete delivery lens for ${service.title.toLowerCase()}.`} text="Each engagement is shaped around site conditions, practical detailing, finish quality and dependable handover." />
            <div className="mt-9 grid gap-4">
              {service.details.map((detail, index) => <SectionReveal key={detail} delay={index * 0.05}><MotionCard className="flex gap-4 border-t border-charcoal/12 pt-5"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-bronze" /><p className="text-base leading-7 text-charcoal/68">{detail}</p></MotionCard></SectionReveal>)}
            </div>
            <Link href="/contact-us/" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-bronze">Discuss this service <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
      <EnquiryCTA image={service.image} />
    </PageShell>
  );
}






