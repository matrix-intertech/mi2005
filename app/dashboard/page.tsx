import Link from "next/link";
import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  let counts = { enquiries: 0, roles: 0, applications: 0 }; let unavailable = false;
  try { const db = await getDb(); const [enquiries, roles, applications] = await Promise.all([db.collection("enquiries").countDocuments({ status: "new" }), db.collection("careerOpenings").countDocuments({ status: "open" }), db.collection("careerApplications").countDocuments({ status: "new" })]); counts = { enquiries, roles, applications }; } catch { unavailable = true; }
  return <><p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Overview</p><h1 className="mt-3 text-4xl font-semibold">Team dashboard</h1><p className="mt-3 max-w-2xl text-base leading-7 text-charcoal/65">A focused view of what needs attention.</p>{unavailable ? <p className="mt-6 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Database is not configured or currently unavailable. Set MONGODB_URI to enable records.</p> : <div className="mt-8 grid gap-4 sm:grid-cols-3">{[["New enquiries", counts.enquiries, "/dashboard/enquiries"], ["Open roles", counts.roles, "/dashboard/careers"], ["New applications", counts.applications, "/dashboard/applications"]].map(([label, count, href]) => <Link key={String(label)} href={String(href)} className="bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><p className="text-sm font-semibold text-charcoal/60">{label}</p><p className="mt-4 text-4xl font-semibold">{count}</p></Link>)}</div>}</>;
}
