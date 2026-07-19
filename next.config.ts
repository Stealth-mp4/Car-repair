import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Live Instagram feed (Graph API) serves images from these CDNs.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "graph.instagram.com" },
    ],
  },
};

export default nextConfig;
