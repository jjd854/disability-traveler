import { fetchDestinationById } from '@/lib/api';
import { notFound } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ReviewCard from '@/components/ui/ReviewCard';
import type { Review } from '@/lib/types';
import { getDestAvg, getDestCount } from '@/lib/utils';
import Link from 'next/link';
import styles from './page.module.css';
import DestinationHotels from './DestinationHotels'; // <-- default import of client child
import OutboundLink from '@/components/ui/analytics/OutboundLink';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await fetchDestinationById(slug);
  if (!destination) notFound();

  const reviews: Review[] = destination._reviews || [];
  const dAvg = getDestAvg(destination);
  const dCount = getDestCount(destination);

  const destinationName = destination.Name || destination.Name || 'Destination';

  const destinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: destinationName,
    url: `https://disabilitytraveler.com/destinations/${slug}`,
    description: destination.Description || undefined,
    image: destination.featured_image_url || destination.featured_image_url || undefined,    
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationSchema) }}
      />
      <main>
        <div className={styles.container}>
          {destination.featured_image_url && (
            <div className={styles.heroWrapper}>
              <img
                src={destination.featured_image_url}
                alt={destination.alt_text || 'Destination image'}
                className={styles.heroImage}
              />
            </div>
          )}

          <div className={styles.overview}>
            <h1>{destination.Name}</h1>
            <p className={styles.textBlock}>
              {dCount > 0 && dAvg != null ? (
                <>
                  Average Accessibility Rating:{' '}
                  <span className={styles.decimal}>{dAvg.toFixed(1)}</span>{' '}
                  <span aria-hidden="true">⭐</span>{' '}
                  <span className={styles.count}>({dCount})</span>
                </>
              ) : (
                'No reviews yet'
              )}
            </p>

            <hr className={styles.divider} />
            <p className={styles.textBlock}><strong>Region:</strong> {destination.Region}</p>
            <p className={styles.textBlock}><strong>Country:</strong> {destination.Country}</p>
            <p className={styles.textBlock}><strong>State/Provence:</strong> {destination.state_or_provence || 'N/A'}</p>
            <p className={styles.textBlock}><strong>City:</strong> {destination.City || 'N/A'}</p>
            <hr className={styles.divider} />
            <p className={styles.textBlock}>{destination.Description || 'No description yet.'}</p>
          </div>

          <div className={styles.section}>
            <Link
              href={{
                pathname: '/submit-review',
                query: { destination: destination.slug, redirect: `/destinations/${destination.slug}` },
              }}
            >
              <button className={styles.reviewButton}>Submit a Review</button>
            </Link>
          </div>

          {/* Accessibility Overview */}
          {destination.accessibility_overview && destination.accessibility_overview.trim() !== "" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Accessibility Overview</h2>
              <div className={styles.sectionBodyPreLine}>
                {destination.accessibility_overview}
             </div>
           </section>
         )}

          {Array.isArray(destination.hotels) && destination.hotels.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>
                Accessible Hotels in {destination.Name}
              </h2>

              {/* Client-side filters + cards */}
              <DestinationHotels
                destinationName={destination.Name}
                hotels={destination.hotels}
              />
            </>
          )}

          {destination.transportation && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Transportation</h2>
              <ul className={styles.bulletList}>
                {destination.transportation.split('\n').map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </section>
          )}

          {destination.activities && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Activities & Attractions</h2>
              <ul className={styles.bulletList}>
                {destination.activities.split('\n').map((item: string, i: number) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </section>
          )}

          {destination.traveler_tips && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Traveler Tips</h2>
              <ul className={styles.bulletList}>
                {destination.traveler_tips.split('\n').map((item: string, i: number) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Local Accessibility Services */}
          {destination.local_accessibility_services &&
            destination.local_accessibility_services.trim() !== "" && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Local Accessibility Services</h2>

                {/* Universal Disclaimer */}
                <p className={styles.servicesDisclaimer}>
                 For informational purposes only. Disability Traveler has not independently
                 verified and does not endorse any business listed below. This list is not
                 exhaustive. Travelers should contact providers directly to confirm
                 availability, pricing, equipment specifications, and suitability for their
                 individual needs.
               </p>

               {/* Provider Content from Xano */}
               <div className={styles.providersList}>
  {destination.local_accessibility_services
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, i) => {
      const [name, url, description] = line.split("|").map(part => part.trim());

      return (
        <div key={i} className={styles.providerItem}>
          <strong>{name}</strong>

          {url && (
           <OutboundLink
             href={url}
             target="_blank"
             rel="noopener noreferrer"
             className={styles.providerLink}
             event="outbound_click"
             params={{
               type: 'accessibility_provider',
               destination_slug: slug,
               provider_name: name,
               provider_url: url,
             }}
           >
             Visit website ↗
           </OutboundLink>
         )}


          <p className={styles.providerDescription}>
            {description}
          </p>
        </div>
      );
    })}
</div>
            </section>
           )}

          {reviews.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>Traveler Reviews</h2>
              {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
