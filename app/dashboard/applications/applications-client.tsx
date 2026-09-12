"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/lib/admin-actions";

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  portfolioOrResumeUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  createdAt: string;
  status: "new" | "reviewed" | "archived";
};

type ApplicationsClientProps = {
  applications: ApplicationRow[];
  roles: string[];
  selectedRole: string;
};

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not recorded";
}

export function ApplicationsClient({ applications, roles, selectedRole }: ApplicationsClientProps) {
  const router = useRouter();

  return (
    <>
      <form className="mt-6">
        <label className="text-sm font-semibold">
          Filter by role{" "}
          <select
            name="role"
            defaultValue={selectedRole}
            className="ml-2 border border-charcoal/15 bg-white px-3 py-2"
            onChange={(event) => {
              const value = event.currentTarget.value;
              router.push(value ? `/dashboard/applications?role=${encodeURIComponent(value)}` : "/dashboard/applications");
            }}
          >
            <option value="">All roles</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </form>
      <div className="mt-6 overflow-x-auto bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-charcoal/55">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Role</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Portfolio / Resume</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => {
              const link = item.portfolioOrResumeUrl || item.portfolioUrl || item.resumeUrl;
              return (
                <tr key={item.id} className="border-b border-charcoal/8 align-top">
                  <td className="p-4 font-semibold">
                    {item.name}
                    <span className="mt-1 block font-normal text-charcoal/60">
                      {item.email || "Not provided"}
                      <br />
                      {item.phone || "Not provided"}
                    </span>
                  </td>
                  <td className="p-4">{item.role}</td>
                  <td className="p-4">{item.experience || "Not provided"}</td>
                  <td className="p-4 text-charcoal/70">
                    {link ? <a href={link} target="_blank" rel="noreferrer" className="underline">Open link</a> : "Not provided"}
                  </td>
                  <td className="p-4">{formatDate(item.createdAt)}</td>
                  <td className="p-4">
                    <form action={updateApplicationStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        name="status"
                        defaultValue={item.status}
                        className="border border-charcoal/15 bg-warm px-2 py-1.5"
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </form>
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/applications/${item.id}`} className="inline-flex border border-charcoal/15 bg-white px-3 py-2 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze">View details</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {applications.length === 0 ? <p className="p-6 text-charcoal/60">No applications yet.</p> : null}
      </div>
    </>
  );
}
