"use client";

import Link from "next/link";
import { updateEnquiryStatus } from "@/lib/admin-actions";

type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectType?: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "archived";
};

type EnquiriesClientProps = {
  enquiries: EnquiryRow[];
};

export function EnquiriesClient({ enquiries }: EnquiriesClientProps) {
  return (
    <div className="mt-8 overflow-x-auto bg-white">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="border-b border-charcoal/10 text-charcoal/55">
          <tr>
            <th className="p-4">Contact</th>
            <th className="p-4">Project</th>
            <th className="p-4">Message</th>
            <th className="p-4">Received</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((item) => (
            <tr key={item.id} className="border-b border-charcoal/8 align-top">
              <td className="p-4 font-semibold">
                {item.name}
                <span className="mt-1 block font-normal text-charcoal/60">
                  {item.email}
                  <br />
                  {item.phone || "No phone"}
                </span>
              </td>
              <td className="p-4">{item.projectType || "General"}</td>
              <td className="max-w-sm p-4 text-charcoal/70">
                <details>
                  <summary className="cursor-pointer line-clamp-2">{item.message}</summary>
                  <p className="mt-3 whitespace-pre-wrap">{item.message}</p>
                </details>
              </td>
              <td className="p-4 text-charcoal/60">{item.createdAt}</td>
              <td className="p-4">
                <form action={updateEnquiryStatus}>
                  <input type="hidden" name="id" value={item.id} />
                  <select
                    name="status"
                    defaultValue={item.status}
                    className="border border-charcoal/15 bg-warm px-2 py-1.5"
                    onChange={(event) => event.currentTarget.form?.requestSubmit()}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </select>
                </form>
              </td>
              <td className="p-4">
                <Link href={`/dashboard/enquiries/${item.id}`} className="inline-flex border border-charcoal/15 bg-white px-3 py-2 text-sm font-semibold text-charcoal hover:border-bronze hover:text-bronze">View details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {enquiries.length === 0 ? <p className="p-6 text-charcoal/60">No enquiries yet.</p> : null}
    </div>
  );
}
