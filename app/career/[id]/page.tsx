import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCareer } from "@/lib/public-careers";
import { careerMetadata, jobSchema } from "@/lib/career-seo";
import { breadcrumbSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo-content";
import { PageHero, PageShell } from "@/components/site";
import { CareerApplicationForm } from "@/components/career-application-form";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const role = await getPublicCareer((await params).id);
  if (!role) return { title: "Opening unavailable | Matrix Intertech", robots: { index: false, follow: false }, alternates: { canonical: null }, openGraph: null, twitter: null };
  return careerMetadata(role);
}
export default async function CareerDetail({ params }: Props) {
  const { id } = await params;
  const role = await getPublicCareer(id);
  if (!role) notFound();
  return <PageShell>
    <JsonLd data={jobSchema(role)} />
    <JsonLd data={{ "@context": "https://schema.org", ...breadcrumbSchema(`/career/${id}`, role.title, { path: "/career", name: "Careers" }) }} />
    <PageHero eyebrow="Career opening" title={role.title} text={role.summary} image="/images/matrix/contact.webp" />
    <section className="bg-warm px-5 py-16 sm:px-6"><div className="mx-auto max-w-[92rem] bg-white p-7 sm:p-8">
      <p className="font-semibold text-bronze">{role.department} / {role.location} / {role.type}</p>
      <p className="mt-3">Experience: {role.experience}</p>
      <p className="mt-3 text-sm">Posted <time dateTime={new Date(role.createdAt).toISOString()}>{new Date(role.createdAt).toISOString().slice(0, 10)}</time></p>
      <h2 className="mt-8 text-2xl font-semibold">Responsibilities</h2>
      <p className="mt-3 whitespace-pre-line leading-7">{role.responsibilities || "Discussed during the process."}</p>
      <h2 className="mt-8 text-2xl font-semibold">Requirements</h2>
      <p className="mt-3 whitespace-pre-line leading-7">{role.requirements || "Discussed during the process."}</p>
      <CareerApplicationForm id={id} role={role.title} requiredFields={role.requiredFields} />
    </div></section>
  </PageShell>;
}
