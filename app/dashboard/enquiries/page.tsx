import { getDb } from "@/lib/db";
import { EnquiriesClient } from "./enquiries-client";
import type { Enquiry } from "@/lib/types";

export default async function EnquiriesPage() {
  const enquiries = await (await getDb()).collection<Enquiry>("enquiries").find().sort({ createdAt: -1 }).toArray();

  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Inbox</p>
      <h1 className="mt-3 text-4xl font-semibold">Enquiries</h1>
      <EnquiriesClient
        enquiries={enquiries.map((item) => ({
          id: item._id?.toString() || "",
          name: item.name,
          email: item.email,
          phone: item.phone,
          projectType: item.projectType,
          message: item.message,
          createdAt: item.createdAt.toLocaleDateString("en-IN"),
          status: item.status,
        }))}
      />
    </>
  );
}
