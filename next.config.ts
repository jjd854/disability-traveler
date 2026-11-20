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
      {
        source: "/hotels/zemi-miches-punta-cana- all-iInclusive-resort-curio-collection-by-hilton",
        destination: "/hotels/zemi-miches-punta-cana-all-inclusive-resort-curio-collection-by-hilton",
        permanent: true,
      },
      {
        source: "/hotels/courtyard-by-marriott-isla-verde-beach-resort",
        destination: "/hotels/marriott-isla-verde-beach-resort",
        permanent: true,
     },
    ];
  },
};

export default nextConfig;
