import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonicalize apex heyjerico.com; keep path when hopping from the old domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "jericolumanlan.com" }],
        destination: "https://heyjerico.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jericolumanlan.com" }],
        destination: "https://heyjerico.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.heyjerico.com" }],
        destination: "https://heyjerico.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
