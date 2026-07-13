import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  images: {
    remotePatterns: [
      // Payload CMS — local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/media/**",
      },
      // Payload CMS — Docker internal
      {
        protocol: "http",
        hostname: "cms",
        port: "3001",
        pathname: "/media/**",
      },
      // Cloudflare R2 — production media storage
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;

