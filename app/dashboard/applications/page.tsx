import { getDb } from "@/lib/db";
import { ApplicationsClient } from "./applications-client";
import type { CareerApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const selectedRole = role || "";
  const db = await getDb();
  const roles = await db.collection("careerApplications").distinct("role");
  const applications = await db
    .collection<CareerApplication>("careerApplications")
    .find(selectedRole ? { role: selectedRole } : {})
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Talent</p>
      <h1 className="mt-3 text-4xl font-semibold">Applications</h1>
      <ApplicationsClient
        selectedRole={selectedRole}
        roles={roles.map(String)}
        applications={applications.map((item) => ({
          id: item._id?.toString() || "",
          name: item.name,
          email: item.email,
          phone: item.phone,
          role: item.role,
          experience: item.experience,
          portfolioOrResumeUrl: item.portfolioOrResumeUrl || item.portfolioUrl || item.resumeUrl,
          portfolioUrl: item.portfolioUrl,
          resumeUrl: item.resumeUrl,
          createdAt: item.createdAt ? item.createdAt.toISOString() : "",
          status: item.status,
        }))}
      />
    </>
  );
}
