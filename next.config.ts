import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nukzqjwqykxakagbjkmn.supabase.co",
        pathname: "/storage/v1/object/public/pos_image/**",
      },
    ],
  },
};

export default nextConfig;
