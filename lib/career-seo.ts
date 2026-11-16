import type { CareerOpening } from "@/lib/types";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { organization } from "@/lib/structured-data";

type PublicCareer = CareerOpening & { isPublic?: boolean; hidden?: boolean; validThrough?: Date | string };
export function isPublicCareer(role: PublicCareer, now = new Date()) {
  return role.status === "open" && role.isPublic !== false && role.hidden !== true &&
    (!role.validThrough || new Date(role.validThrough).getTime() > now.getTime());
}
export function careerMetadata(role: CareerOpening) {
  const id = role._id!.toString();
  // An ID suffix distinguishes separate openings with the same title/location.
  return pageMetadata(`/career/${id}`, `${role.title} (${role.location}) - ${id} | Matrix Intertech Careers`,
    `Apply for ${role.title} at Matrix Intertech in ${role.location}. ${role.type}. ${role.summary.slice(0, 100)} Opening ${id}.`);
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
export function jobLocation(location: string) {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  const countryName = parts.at(-1);
  if (!countryName || parts.length < 2) return null;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  // Resolve only a country explicitly supplied in the visible location.
  for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) {
    const code = String.fromCharCode(a, b);
    const name = names.of(code);
    if (name !== code && (countryName.toLowerCase() === name?.toLowerCase() || countryName === code)) {
      return { "@type": "Place", name: location, address: {
        "@type": "PostalAddress", addressLocality: parts.slice(0, -1).join(", "), addressCountry: code,
      } };
    }
  }
  return null;
}
export function jobSchema(role: PublicCareer) {
  const location = jobLocation(role.location);
  if (!isPublicCareer(role) || !location || !role.title.trim() || !role.summary.trim() ||
      !Number.isFinite(new Date(role.createdAt).getTime())) return null;
  const employment = { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Contract: "CONTRACTOR", Internship: "INTERN" };
  return {
    "@context": "https://schema.org", "@type": "JobPosting",
    title: role.title, url: absoluteUrl(`/career/${role._id!.toString()}`),
    identifier: { "@type": "PropertyValue", name: "Matrix Intertech", value: role._id!.toString() },
    description: [role.summary, `Responsibilities: ${role.responsibilities || "Discussed during the process."}`,
      `Requirements: ${role.requirements || "Discussed during the process."}`, `Experience: ${role.experience}`]
      .map((text) => `<p>${escapeHtml(text)}</p>`).join(""),
    datePosted: new Date(role.createdAt).toISOString(),
    ...(role.validThrough ? { validThrough: new Date(role.validThrough).toISOString() } : {}),
    employmentType: employment[role.type], hiringOrganization: organization,
    // Incomplete/ambiguous locations omit markup instead of publishing invalid job data.
    jobLocation: location,
  };
}
