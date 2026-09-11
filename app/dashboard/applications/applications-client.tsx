"use client";

import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/lib/admin-actions";

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  status: "new" | "reviewed" | "archived";
};

type ApplicationsClientProps = {
  applications: ApplicationRow[];
  roles: string[];
  selectedRole: string;
};

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
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-charcoal/55">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Role</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Links</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => (
              <tr key={item.id} className="border-b border-charcoal/8 align-top">
                <td className="p-4 font-semibold">
                  {item.name}
                  <span className="mt-1 block font-normal text-charcoal/60">
                    {item.email}
                    <br />
                    {item.phone}
                  </span>
                </td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{item.experience}</td>
                <td className="p-4 text-charcoal/70">
                  {item.portfolioUrl ? (
                    <a href={item.portfolioUrl} target="_blank" rel="noreferrer" className="block underline">
                      Portfolio
                    </a>
                  ) : null}
                  {item.resumeUrl ? (
                    <a href={item.resumeUrl} target="_blank" rel="noreferrer" className="mt-1 block underline">
                      Resume
                    </a>
                  ) : null}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 ? <p className="p-6 text-charcoal/60">No applications yet.</p> : null}
      </div>
    </>
  );
}
