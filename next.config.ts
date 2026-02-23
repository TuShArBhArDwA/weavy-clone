import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "assets.weavy.ai", // Adding this just in case you use images from their asset server too
      },
    ],
  },
};

export default nextConfig;