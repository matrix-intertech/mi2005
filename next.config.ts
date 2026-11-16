import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/login", "/dashboard/:path*", "/api/:path*"].map((source) => ({
      source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;
