import type { Metadata } from "next";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/contact-us");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };
import { Mail, MapPin, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHero, PageShell, SectionHeader } from "@/components/site";
import { contact } from "@/lib/site-data";

export default function Page() {
  return (
    <PageShell>
      <PageHero eyebrow="Contact" title="Start with the site, scope and timeline." text="Share project basics and the team can follow up with the right next step. Enquiries are delivered through the configured contact email workflow." image="/images/matrix/contact.webp" />
      <section className="bg-warm px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <SectionHeader eyebrow="Reach us" title="Delhi office and project team." />
            <div className="mt-8 grid gap-5">
              <ContactCard icon={<MapPin className="h-5 w-5" />} title="Address" text={contact.address} />
              <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" text={contact.email} />
              <ContactCard icon={<Phone className="h-5 w-5" />} title="Phone" text={contact.phone} />
            </div>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex gap-4 bg-white p-6 text-charcoal"><div className="mt-1 text-bronze">{icon}</div><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-charcoal/65">{text}</p></div></div>;
}




