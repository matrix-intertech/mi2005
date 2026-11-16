import Link from "next/link";
import { BriefcaseBusiness, Building2, Inbox, LayoutDashboard } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
    { href: "/dashboard/careers", label: "Careers", icon: BriefcaseBusiness },
    { href: "/dashboard/portfolio", label: "Portfolio Management", icon: Building2 },
    { href: "/dashboard/applications", label: "Applications", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-warm text-charcoal lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="border-r border-white/10 bg-charcoal p-5 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overscroll-contain">
        <Link href="/dashboard" className="block border-b border-white/15 pb-5 text-xl font-semibold">
          Matrix <span className="text-bronze">Admin</span>
        </Link>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-x-visible" aria-label="Dashboard navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 lg:mt-auto lg:pt-6">
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
