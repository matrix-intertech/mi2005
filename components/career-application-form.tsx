"use client";

import { useState } from "react";
import type { RequiredApplicationFields } from "@/lib/types";

type CareerApplicationFormProps = {
  id: string;
  role: string;
  requiredFields?: RequiredApplicationFields;
};

const fallbackRequiredFields: Required<RequiredApplicationFields> = {
  phone: true,
  email: true,
  portfolioOrResumeUrl: true,
  experience: false,
  coverLetter: false,
};

export function CareerApplicationForm({ id, role, requiredFields }: CareerApplicationFormProps) {
  const fields = { ...fallbackRequiredFields, ...(requiredFields || {}) };
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(data: FormData) {
    setSending(true);
    setMessage("");
    const response = await fetch(`/api/career/${id}/apply`, { method: "POST", body: data });
    const result = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    setMessage(response.ok ? "Thank you. Your application has been received." : result.error || result.message || "Unable to submit your application.");
    setSending(false);
    if (response.ok) (document.getElementById(`application-${id}`) as HTMLFormElement)?.reset();
  }

  return (
    <form id={`application-${id}`} action={submit} className="mt-5 grid gap-4 border-t border-charcoal/10 pt-5 sm:grid-cols-2">
      <ApplicationInput name="name" placeholder="Name" required />
      <ApplicationInput name="email" type="email" placeholder="Email address" required={fields.email} />
      <ApplicationInput name="phone" placeholder="Phone number" required={fields.phone} />
      <ApplicationInput name="experience" placeholder="Experience" required={fields.experience} />
      <ApplicationInput name="portfolioOrResumeUrl" type="url" placeholder="Paste Google Drive, LinkedIn, portfolio, or resume URL" required={fields.portfolioOrResumeUrl} className="sm:col-span-2" label="Portfolio / Resume link" />
      <textarea name="message" required={fields.coverLetter} placeholder={`Cover letter${fields.coverLetter ? "" : " (optional)"} for ${role}`} rows={4} className="border border-charcoal/15 bg-warm px-3 py-2.5 text-sm sm:col-span-2" />
      <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <button disabled={sending} className="w-fit bg-charcoal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{sending ? "Sending..." : "Submit application"}</button>
      {message ? <p className="self-center text-sm text-charcoal/70" role="status">{message}</p> : null}
    </form>
  );
}

function ApplicationInput({ name, placeholder, required, type = "text", className = "", label }: { name: string; placeholder: string; required?: boolean; type?: string; className?: string; label?: string }) {
  const displayPlaceholder = `${placeholder}${required ? " *" : ""}`;
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.12em] text-charcoal/55">{label}{required ? " *" : ""}</span> : null}
      <input name={name} type={type} required={required} placeholder={displayPlaceholder} className="w-full border border-charcoal/15 bg-warm px-3 py-2.5 text-sm" />
    </label>
  );
}
