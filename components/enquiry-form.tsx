"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/enquiry", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(data?.message || "Unable to send enquiry.");
      setStatus("sent");
      setMessage("Thank you. Your enquiry has been sent to the Matrix Intertech team.");
      (document.getElementById("project-enquiry") as HTMLFormElement | null)?.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send enquiry right now.");
    }
  }

  return (
    <form id="project-enquiry" action={submit} className="border border-charcoal/10 bg-white p-6 shadow-[0_30px_90px_rgba(16,24,32,.08)] sm:p-8">
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-bronze">Project enquiry</p>
        <h2 className="mt-3 text-3xl font-semibold text-charcoal">Tell us what you want to build.</h2>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" />
        <Field name="projectType" label="Project type" placeholder="Commercial, Residential..." />
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-charcoal">Project brief</span>
        <textarea name="message" required rows={5} className="mt-2 w-full rounded-sm border border-charcoal/55 bg-warm px-4 py-3 text-base outline-none ring-bronze transition focus:ring-4" placeholder="Tell us about the site, location, timeline and scope." />
      </label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" disabled={status === "sending"} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-bronze disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending..." : "Send enquiry"} <Send className="h-4 w-4" />
      </button>
      {message ? <p className={`mt-4 text-sm font-medium ${status === "error" ? "text-red-700" : "text-emerald-700"}`} role={status === "error" ? "alert" : "status"} aria-live="polite">{message}</p> : null}
    </form>
  );
}

function Field({ name, label, type = "text", placeholder, required = false }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block"><span className="text-sm font-semibold text-charcoal">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 w-full rounded-sm border border-charcoal/55 bg-warm px-4 py-3 text-base outline-none ring-bronze transition focus:ring-4" /></label>;
}




