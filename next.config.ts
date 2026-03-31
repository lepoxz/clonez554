import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tainguyenst.com"
      }
    ]
  }
};

export default nextConfig;
