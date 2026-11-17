import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import type { ObjectId } from "mongodb";
import { updateApplicationStatus } from "@/lib/admin-actions";
import { getDb } from "@/lib/db";
import type { CareerApplication, CareerOpening } from "@/lib/types";

export const dynamic = "force-dynamic";

type ApplicationWithOptionalFields = CareerApplication & { updatedAt?: Date; openingId?: ObjectId };

function formatDate(value?: Date) {
  return value ? value.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-charcoal/45">{label}</p><p className="mt-2 text-base font-medium text-charcoal break-words">{value || "Not provided"}</p></div>;
}

function StatusAction({ id, status, label }: { id: string; status: "reviewed" | "archived"; label: string }) {
  return (
    <form action={updateApplicationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="w-full border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-bronze hover:text-bronze sm:w-auto">{label}</button>
    </form>
  );
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { ObjectId } = await import("mongodb");

  if (!ObjectId.isValid(id)) {
    return <MissingApplication message="This application link is not valid." />;
  }

  const db = await getDb();
  const application = await db.collection<ApplicationWithOptionalFields>("careerApplications").findOne({ _id: new ObjectId(id) });
  if (!application) return <MissingApplication message="This application could not be found or may have been removed." />;

  const relatedId = application.openingId || application.careerId;
  const opening = ObjectId.isValid(String(relatedId)) ? await db.collection<CareerOpening>("careerOpenings").findOne({ _id: new ObjectId(String(relatedId)) }) : null;
  const email = application.email?.trim();
  const portfolioOrResumeUrl = application.portfolioOrResumeUrl || application.portfolioUrl || application.resumeUrl;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Application detail</p>
          <h1 className="mt-3 text-4xl font-semibold">{application.name}</h1>
          <p className="mt-2 text-sm font-semibold text-charcoal/55">Status: <span className="text-charcoal">{application.status}</span></p>
        </div>
        <Link href="/dashboard/applications" className="inline-flex items-center gap-2 border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze"><ArrowLeft className="h-4 w-4" />Back to applications</Link>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_.75fr]">
        <section className="bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Application details</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field label="Role" value={application.role} />
            <Field label="Experience" value={application.experience} />
            <Field label="Portfolio / Resume link" value={portfolioOrResumeUrl} />
            <Field label="Status" value={application.status} />
            <Field label="Opening id" value={relatedId ? String(relatedId) : undefined} />
          </div>
          <div className="mt-8 border-t border-charcoal/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-charcoal/45">Message</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-charcoal/72">{application.message || "Not provided"}</p>
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Applicant</h2>
            <div className="mt-6 grid gap-5">
              <Field label="Name" value={application.name} />
              <Field label="Email" value={email} />
              <Field label="Phone" value={application.phone} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze"><Mail className="h-4 w-4" />Reply by email</a> : null}
              {portfolioOrResumeUrl ? <a href={portfolioOrResumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze">Portfolio / Resume <ExternalLink className="h-4 w-4" /></a> : <span className="text-sm text-charcoal/55">Portfolio / Resume not provided</span>}
            </div>
          </section>

          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Related opening</h2>
            {opening ? <div className="mt-5 grid gap-4"><Field label="Title" value={opening.title} /><Field label="Department" value={opening.department} /><Field label="Location" value={opening.location} /><Field label="Type" value={opening.type} /><Field label="Opening status" value={opening.status} /></div> : <p className="mt-4 text-base leading-7 text-charcoal/62">No related opening record was found.</p>}
          </section>

          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Timeline</h2>
            <div className="mt-5 grid gap-5">
              <Field label="Created" value={formatDate(application.createdAt)} />
              <Field label="Updated" value={formatDate(application.updatedAt)} />
            </div>
          </section>

          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Actions</h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <StatusAction id={id} status="reviewed" label="Mark reviewed" />
              <StatusAction id={id} status="archived" label="Archive" />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function MissingApplication({ message }: { message: string }) {
  return <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Application detail</p><h1 className="mt-3 text-4xl font-semibold">Application unavailable</h1><p className="mt-4 max-w-2xl text-base leading-7 text-charcoal/65">{message}</p><Link href="/dashboard/applications" className="mt-6 inline-flex border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze">Back to applications</Link></div>;
}
