/** @type {import('next').NextConfig} */

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const apiUrl = new URL(apiBaseUrl);

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        port: apiUrl.port || "",
        pathname: "/uploads/**",
      },

      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.muta7markt.com",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.muta7markt.com",
        pathname: "/uploads/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
