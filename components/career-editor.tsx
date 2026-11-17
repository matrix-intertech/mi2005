import { saveCareer } from "@/lib/admin-actions";
import type { CareerOpening, RequiredApplicationFields } from "@/lib/types";

const defaultRequiredFields: Required<RequiredApplicationFields> = {
  phone: true,
  email: true,
  portfolioOrResumeUrl: true,
  experience: false,
  coverLetter: false,
};

function getRequiredFields(role?: CareerOpening): Required<RequiredApplicationFields> {
  return { ...defaultRequiredFields, ...(role?.requiredFields || {}) };
}

export function CareerEditor({ role }: { role?: CareerOpening }) {
  const requiredFields = getRequiredFields(role);

  return (
    <form action={saveCareer} className="mt-8 max-w-4xl space-y-5 bg-white p-6 sm:p-8">
      <input type="hidden" name="id" value={role?._id?.toString() || ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" name="title" value={role?.title} required />
        <Field label="Department" name="department" value={role?.department} required />
        <Field label="Location" name="location" value={role?.location} required />
        <Field label="Experience" name="experience" value={role?.experience} />
        <label className="block text-sm font-semibold">
          Employment type
          <select name="type" defaultValue={role?.type || "Full-time"} className="mt-2 w-full border border-charcoal/55 bg-warm px-3 py-2.5">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Status
          <select name="status" defaultValue={role?.status || "open"} className="mt-2 w-full border border-charcoal/55 bg-warm px-3 py-2.5">
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>

      <section className="border border-charcoal/10 bg-warm p-5">
        <h2 className="text-base font-semibold">Required application fields</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <RequiredField name="required_phone" label="Phone number" checked={requiredFields.phone} />
          <RequiredField name="required_email" label="Email address" checked={requiredFields.email} />
          <RequiredField name="required_portfolioOrResumeUrl" label="Portfolio / Resume link" checked={requiredFields.portfolioOrResumeUrl} />
          <RequiredField name="required_experience" label="Experience" checked={requiredFields.experience} />
          <RequiredField name="required_coverLetter" label="Cover letter" checked={requiredFields.coverLetter} />
        </div>
      </section>

      <Area label="Summary" name="summary" value={role?.summary} required />
      <Area label="Responsibilities" name="responsibilities" value={role?.responsibilities} />
      <Area label="Requirements" name="requirements" value={role?.requirements} />
      <button className="bg-charcoal px-5 py-3 text-sm font-semibold text-white">Save opening</button>
    </form>
  );
}

function RequiredField({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-charcoal/78">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-bronze" />
      {label}
    </label>
  );
}

function Field({ label, name, value, required = false }: { label: string; name: string; value?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<input name={name} defaultValue={value} required={required} className="mt-2 w-full border border-charcoal/55 bg-warm px-3 py-2.5 font-normal" /></label>;
}

function Area({ label, name, value, required = false }: { label: string; name: string; value?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<textarea name={name} defaultValue={value} required={required} rows={4} className="mt-2 w-full border border-charcoal/55 bg-warm px-3 py-2.5 font-normal" /></label>;
}
