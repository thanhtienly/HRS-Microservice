import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  env: {
    apiGatewayHost: "http://localhost:3001",
  },
};

export default nextConfig;
