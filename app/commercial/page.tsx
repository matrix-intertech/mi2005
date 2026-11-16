import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata("/commercial");
import { ServicePage } from "@/components/service-page";
export default function Page() { return <ServicePage slug="commercial" />; }

