/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nukzqjwqykxakagbjkmn.supabase.co",
        pathname: "/storage/v1/object/public/pos_image/**",
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
