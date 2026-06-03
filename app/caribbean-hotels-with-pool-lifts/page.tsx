import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HotelCard from "@/components/ui/HotelCard";
import styles from "./page.module.css";

export const metadata = {
  title: "Caribbean Hotels with Pool Lifts | Disability Traveler",
  description:
    "Browse Caribbean hotels and resorts with pool lifts for wheelchair users and travelers with mobility disabilities.",
};

async function getHotelsWithPoolLifts() {
  const res = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/caribbean_hotels_with_pool_lifts",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  const hotels = await res.json();

  return hotels;
  
}

export default async function CaribbeanPoolLiftHotelsPage() {
  const hotels = await getHotelsWithPoolLifts();

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Accessible Caribbean Hotels</p>
          <h1>
            Caribbean Hotels with{' '}
            <span className={styles.noWrap}>Pool Lifts</span>
          </h1>
          <p>
            A pool lift can make a resort pool independently accessible for wheelchair users and travelers with mobility disabilities. This page highlights Caribbean hotels on Disability Traveler that list a pool lift among their accessibility features
          </p>
        </section>

        <section className={styles.note}>
          <strong>Important:</strong> Pool lift availability, condition, staff
          assistance, and operating procedures can change. Always contact the
          hotel directly before booking to confirm that the pool lift is
          available and suitable for your needs.
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