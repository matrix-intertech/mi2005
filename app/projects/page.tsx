import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata("/projects");
import { EnquiryCTA, PageHero, PageShell, PreviousClients, SectionHeader } from "@/components/site";
import { MotionCard, ParallaxImage, SectionReveal } from "@/components/motion";
import { projects } from "@/lib/site-data";

export default function Page() {
  return (
    <PageShell seoPath="/projects">
      <PageHero eyebrow="Projects" title="Project environments built for daily use and long-term impression." text="Explore corporate, commercial and residential interior project categories and the scope of Matrix Intertech turnkey interior execution. Detailed case studies depend on available photography and client approvals." image="/images/matrix/projects-office.webp" />
      <section className="bg-warm px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[92rem]">
          <SectionHeader eyebrow="Project types" title="Corporate, commercial, residential and execution-led environments." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => <SectionReveal key={project.title} delay={index * 0.05} className="h-full"><MotionCard className="group flex h-full flex-col bg-white"><div className="relative aspect-[16/8] overflow-hidden"><ParallaxImage src={project.image} alt={project.title} className="absolute inset-0" strength={10} /></div><div className="p-7"><p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">0{index + 1}</p><h2 className="mt-3 text-2xl font-semibold">{project.title}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-charcoal/66">{project.text}</p></div></MotionCard></SectionReveal>)}
          </div>
        </div>
      </section>
      <PreviousClients />
      <EnquiryCTA image="/images/matrix/projects-office.webp" />
    </PageShell>
  );
}






