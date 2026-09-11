import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site";

export default function NotFound() {
  return (
    <PageShell>
      <main className="bg-warm px-5 py-28 sm:px-8">
        <section className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-bronze">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-charcoal sm:text-7xl">This page is not on the plan.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/68">The page may have moved during the rebuild. Continue to the Matrix Intertech homepage or start a project enquiry.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center rounded-sm border border-charcoal/20 px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-white">Back to home</Link>
            <Link href="/contact-us" className="inline-flex items-center justify-center gap-2 rounded-sm bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-bronze">Start enquiry <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
