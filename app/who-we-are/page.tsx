import type { Metadata } from "next";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/who-we-are");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };
import { CheckCircle2 } from "lucide-react";
import { EnquiryCTA, PageHero, PageShell, PreviousClients, SectionHeader, TrustStrip } from "@/components/site";
import { companyFacts } from "@/lib/site-data";

export default function Page() {
  return (
    <PageShell>
      <PageHero eyebrow="Who we are" title="Interior and architectural delivery with one accountable project team." text="Founded in 2005, Matrix Intertech brings planning, detailing, site execution and handover into a unified turnkey process." image="/images/matrix/hero-studio.webp" />
      <TrustStrip />
      <section className="bg-warm px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHeader eyebrow="Company" title="We take responsibility for the client need, from concept to complete implementation." text="The old site positioned Matrix as an integrated interior and architectural services company. This rebuild preserves that substance and gives it a cleaner, safer presentation." />
          <div className="grid gap-4">
            {companyFacts.map((fact) => <div key={fact} className="flex gap-4 bg-white p-6"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-bronze" /><p className="text-base leading-7 text-charcoal/68">{fact}</p></div>)}
          </div>
        </div>
      </section>
      <PreviousClients />
      <EnquiryCTA />
    </PageShell>
  );
}




