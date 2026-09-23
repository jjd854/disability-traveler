import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HotelCard from "@/components/ui/HotelCard";
import styles from "./page.module.css";

export const metadata = {
  title: "Accessible All-Inclusive Resorts in the Caribbean | Disability Traveler",
  description:
    "Explore all-inclusive Caribbean resorts with accessible rooms and resort amenities. Disability Traveler provides detailed accessibility information including roll-in showers, pool access, beach wheelchairs, accessible pathways and more.",
};


async function getHotelsWithBeachWheelchairs() {
  const res = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/caribbean_all_inclusive_hotels",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  const hotels = await res.json();

  return [...hotels].sort((a, b) => {
    const countryCompare = (a.country ?? "").localeCompare(
      b.country ?? ""
    );

    if (countryCompare !== 0) {
      return countryCompare;
    }

    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export default async function CaribbeanBeachWheelchairHotelsPage() {
  const hotels = await getHotelsWithBeachWheelchairs();

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Accessible Caribbean Hotels</p>
          <h1>
            Accessible All-Inclusive Hotels{' '}
            <span className={styles.noWrap}>in the Caribbean</span>
          </h1>
          <p>
            Explore all-inclusive Caribbean resorts with accessible rooms and resort amenities. Disability Traveler provides detailed accessibility information including roll-in showers, pool access, beach wheelchairs, accessible pathways and more.
          </p>
        </section>

        <section className={styles.note}>
          <strong>Important:</strong> Some resorts are adults only. Disability Traveler identifies adults-only resorts but does not track the minimum age required by each property. When in doubt, contact the resort directly to confirm its age policy.
        </section>

        <section className={styles.grid}>
          {hotels.map((hotel: any) => (
            <HotelCard key={hotel.id} {...hotel} showLocation />
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}