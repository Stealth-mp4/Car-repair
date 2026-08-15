import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Live Instagram feed (Graph API) serves images from these CDNs.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "graph.instagram.com" },
      // Promo images the office uploads through the console live in the
      // `promo-images` bucket. Without this every uploaded offer renders as a
      // broken image on the public site — next/image refuses unlisted hosts.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
