import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  eslint: {
    ignoreDuringBuilds: true,
  },
  // Increase static generation timeout to avoid premature timeouts
  // when building pages
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
