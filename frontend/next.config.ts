import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  env: {
    apiGatewayHost: "http://localhost:3001",
    frontendHost: "http://localhost:80",
  },
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
};

export default nextConfig;
