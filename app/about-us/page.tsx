import { AboutPage } from "@/app/who-we-are/page";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata("/about-us");

export default function Page() {
  return <AboutPage seoPath="/about-us" />;
}
