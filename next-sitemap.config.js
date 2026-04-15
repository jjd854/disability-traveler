const axios = require("axios");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://disabilitytraveler.com',
  generateRobotsTxt: true,

  additionalPaths: async (config) => {
    const paths = [];

    const staticRoutes = [
      '',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/disclaimer',
      '/destinations',
      '/hotels',
      '/submit-review',
    ];

    for (const route of staticRoutes) {
      paths.push({
        loc: route,
        changefreq: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        lastmod: new Date().toISOString(),
      });
    }

    try {
      const [destinationsRes, hotelsRes] = await Promise.all([
        axios.get("https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/destinations_sitemap"),
        axios.get("https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/hotels_sitemap"),
      ]);

      const destinationsJson = destinationsRes.data;
      const hotelsJson = hotelsRes.data;

      console.log("DESTINATIONS JSON:", destinationsJson);
      console.log("HOTELS JSON:", hotelsJson);

      const destinations = Array.isArray(destinationsJson)
        ? destinationsJson
        : destinationsJson.items || destinationsJson.data || destinationsJson.result || [];

      const hotels = Array.isArray(hotelsJson)
        ? hotelsJson
        : hotelsJson.items || hotelsJson.data || hotelsJson.result || [];

      for (const d of destinations) {
        if (d?.slug) {
          paths.push({
            loc: `/destinations/${d.slug}`,
            changefreq: "weekly",
            priority: 0.9,
            lastmod: new Date().toISOString(),
          });
        }
      }

  for (const h of hotels) {
    if (h?.slug) {
      paths.push({
        loc: `/hotels/${h.slug}`,
        changefreq: "weekly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      });
    }
  }
} catch (error) {
  console.error("Error generating sitemap paths:", error);
}

    return paths;
  },
};