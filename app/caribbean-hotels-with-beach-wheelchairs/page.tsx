import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HotelCard from "@/components/ui/HotelCard";
import styles from "./page.module.css";

export const metadata = {
  title: "Caribbean Hotels with Beach Wheelchairs | Disability Traveler",
  description:
    "Browse Caribbean hotels and resorts with beach wheelchairs for wheelchair users and travelers with mobility disabilities.",
};


async function getHotelsWithBeachWheelchairs() {
  const res = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/caribbean_hotels_with_beach_wheelchairs",
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
            Caribbean Hotels with{' '}
            <span className={styles.noWrap}>Beach Wheelchairs</span>
          </h1>
          <p>
            A Beach Wheelchair can make a resort's beach accessible for wheelchair users and travelers with mobility disabilities. This page highlights Caribbean hotels on Disability Traveler that list a beach wheelchairs among their accessibility features
          </p>
        </section>

        <section className={styles.note}>
          <strong>Important:</strong> Beach wheelchair availability, operating condition, and assistance policies can change. Most beach wheelchairs require assistance from resort staff or a companion and are not intended for independent use. Always contact the hotel before booking to confirm availability and whether the chair meets your needs.
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