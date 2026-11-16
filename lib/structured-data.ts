import { absoluteUrl, getRouteSeo, type RoutePath } from "@/lib/seo";
import { contact, services } from "@/lib/site-data";

export const organization = {
  "@type": "Organization", "@id": absoluteUrl("/#organization"),
  name: "Matrix Intertech", legalName: "Matrix Intertech Pvt. Ltd.",
  url: absoluteUrl("/"), logo: absoluteUrl("/images/matrix/logo.png"),
  foundingDate: "2005", telephone: contact.phone, email: contact.email,
  address: { "@type": "PostalAddress", streetAddress: "G-68/B, LGF, Kalkaji", addressLocality: "New Delhi", addressCountry: "IN" },
};

export function breadcrumbSchema(path: string, name: string, parent?: { path: string; name: string }) {
  const items = [{ path: "/", name: "Home" }, ...(parent ? [parent] : []), { path, name }];
  return { "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({
    "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path),
  })) };
}

type Answer = { question: string; answer: string };
export function pageAnswers(path: RoutePath): Answer[] {
  const service = services.find((item) => `/${item.slug}` === path);
  if (service) return [
    { question: `What does Matrix's ${service.title.toLowerCase()} service cover?`, answer: `${service.summary} ${service.details.join(" ")}` },
    { question: "What information should I share for a project enquiry?", answer: "Share the site location, intended use, approximate area, scope and target timeline. The team can then discuss site conditions, design requirements and execution planning." },
  ];
  if (path === "/") return [
    { question: "What does Matrix Intertech do?", answer: "Matrix Intertech provides interior design, architecture coordination and turnkey fitout execution for corporate, residential and commercial spaces, from concept and site inspection to finishes and handover." },
    { question: "Where is Matrix Intertech based?", answer: `Founded in Delhi in 2005, Matrix Intertech is based at ${contact.address}.` },
  ];
  if (path === "/process") return [
    { question: "What are the stages of a turnkey interiors project?", answer: "The process covers site inspection, concept and sketch, detailed design, estimate and agreement, site execution, then finishes and handover." },
    { question: "When are scope and costs agreed?", answer: "A detailed estimate is compiled from the design project so scope, materials and costs are visible before execution begins." },
  ];
  if (path === "/contact-us") return [
    { question: "How can I contact Matrix Intertech about a project?", answer: `Use the enquiry form on this page, email ${contact.email}, or call ${contact.phone}. Include the location, project type, approximate area and your requirements.` },
  ];
  if (path === "/career") return [
    { question: "How do I apply for an open role?", answer: "Review the current openings and their responsibilities and requirements, then complete the application form for the role. Required application fields are shown on the form." },
    { question: "Where can I find current vacancies?", answer: "Current vacancies are listed on this page. If no openings are listed, check this page again for future opportunities." },
  ];
  return [];
}

export function pageSchemas(path: RoutePath) {
  const seo = getRouteSeo(path);
  const graph: Record<string, unknown>[] = path === "/" ? [organization, {
    "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl("/"), name: "Matrix Intertech",
    publisher: { "@id": organization["@id"] }, inLanguage: "en",
  }] : [breadcrumbSchema(path, seo.title.split(" | ")[0])];
  const service = services.find((item) => `/${item.slug}` === path);
  if (service) graph.push({ "@type": "Service", "@id": absoluteUrl(`${path}#service`),
    name: service.title, serviceType: service.title, description: service.summary,
    url: absoluteUrl(path), image: absoluteUrl(service.image), provider: organization,
  });
  // The answers below are also rendered visibly; no search rich-result eligibility is assumed.
  const answers = pageAnswers(path);
  if (answers.length) graph.push({ "@type": "FAQPage", mainEntity: answers.map(({ question, answer }) => ({
    "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
  })) });
  return { "@context": "https://schema.org", "@graph": graph };
}
