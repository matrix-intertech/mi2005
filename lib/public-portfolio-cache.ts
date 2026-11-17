import "server-only";
import { revalidateTag } from "next/cache";

export const PUBLIC_PORTFOLIO_TAG = "public-portfolio";

export function invalidatePublicPortfolio() {
  // Admin mutations must not serve a stale visibility/deletion result on the next visit.
  revalidateTag(PUBLIC_PORTFOLIO_TAG, { expire: 0 });
}
