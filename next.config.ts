import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.filestackcontent.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/hotels/grand-cayman-marriott-resort",
        destination: "/hotels/grand-cayman-marriott-beach-resort",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
