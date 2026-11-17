import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/images/matrix/optimized/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }, ...["/login", "/dashboard/:path*", "/api/:path*"].map((source) => ({
      source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    })), ...["/login", "/dashboard/:path*", "/api/:path*"].map((source) => ({
      source, headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
    }))];
  },
};

export default async function configure() {
  // Production starts must not require an optional development-only analyzer.
  if (process.env.ANALYZE !== "true") return nextConfig;
  const { default: bundleAnalyzer } = await import("@next/bundle-analyzer");
  return bundleAnalyzer({ enabled: true, openAnalyzer: false })(nextConfig);
}
