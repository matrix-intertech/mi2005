import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { ObjectId } from "mongodb";
import { updateEnquiryStatus } from "@/lib/admin-actions";
import { getDb } from "@/lib/db";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

type EnquiryWithUpdatedAt = Enquiry & { updatedAt?: Date };

function formatDate(value?: Date) {
  return value ? value.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-charcoal/45">{label}</p><p className="mt-2 text-base font-medium text-charcoal">{value || "Not provided"}</p></div>;
}

function StatusAction({ id, status, label }: { id: string; status: "read" | "archived"; label: string }) {
  return (
    <form action={updateEnquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="w-full border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-bronze hover:text-bronze sm:w-auto">{label}</button>
    </form>
  );
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return <MissingEnquiry message="This enquiry link is not valid." />;
  }

  const enquiry = await (await getDb()).collection<EnquiryWithUpdatedAt>("enquiries").findOne({ _id: new ObjectId(id) });
  if (!enquiry) return <MissingEnquiry message="This enquiry could not be found or may have been removed." />;

  const email = enquiry.email?.trim();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Enquiry detail</p>
          <h1 className="mt-3 text-4xl font-semibold">{enquiry.name}</h1>
          <p className="mt-2 text-sm font-semibold text-charcoal/55">Status: <span className="text-charcoal">{enquiry.status}</span></p>
        </div>
        <Link href="/dashboard/enquiries" className="inline-flex items-center gap-2 border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze"><ArrowLeft className="h-4 w-4" />Back to enquiries</Link>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_.75fr]">
        <section className="bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Project details</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field label="Project type" value={enquiry.projectType} />
            <Field label="Location" value={enquiry.location} />
            <Field label="Approximate area" value={enquiry.approxArea} />
            <Field label="Source" value={enquiry.source} />
          </div>
          <div className="mt-8 border-t border-charcoal/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-charcoal/45">Message</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-charcoal/72">{enquiry.message}</p>
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Contact details</h2>
            <div className="mt-6 grid gap-5">
              <Field label="Name" value={enquiry.name} />
              <Field label="Email" value={email} />
              <Field label="Phone" value={enquiry.phone} />
              <Field label="Company" value={enquiry.companyName} />
            </div>
            {email ? <a href={`mailto:${email}`} className="mt-6 inline-flex items-center gap-2 bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze"><Mail className="h-4 w-4" />Reply by email</a> : null}
          </section>

          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Timeline</h2>
            <div className="mt-5 grid gap-5">
              <Field label="Created" value={formatDate(enquiry.createdAt)} />
              <Field label="Updated" value={formatDate(enquiry.updatedAt)} />
            </div>
          </section>

          <section className="bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Actions</h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <StatusAction id={id} status="read" label="Mark as read" />
              <StatusAction id={id} status="archived" label="Archive" />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function MissingEnquiry({ message }: { message: string }) {
  return <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Enquiry detail</p><h1 className="mt-3 text-4xl font-semibold">Enquiry unavailable</h1><p className="mt-4 max-w-2xl text-base leading-7 text-charcoal/65">{message}</p><Link href="/dashboard/enquiries" className="mt-6 inline-flex border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze">Back to enquiries</Link></div>;
}
