import { requireAdmin } from "@/lib/admin";
import { PortfolioManager } from "./portfolio-manager";
export const dynamic = "force-dynamic";
export default async function PortfolioPage() {
  await requireAdmin();
  return <PortfolioManager />;
}
