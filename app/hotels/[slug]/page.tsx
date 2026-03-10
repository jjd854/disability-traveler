import { notFound } from 'next/navigation';
import { fetchHotelBySlug } from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import styles from './page.module.css';
import HotelPhotoGallery from '@/components/ui/HotelPhotoGallery';
import ReviewCard from '@/components/ui/ReviewCard';
import type { Review, RoomCategory } from '@/lib/types';
import Link from 'next/link';
import { getHotelAvg, getHotelCount } from '@/lib/utils';
import RoomAmenitiesSection from '@/components/ui/RoomAmenitiesSection';
import OutboundLink from '@/components/ui/analytics/OutboundLink';

interface Props {
  params: Promise<{ slug: string }>;
}

type PhotoItem = {
  id: number;
  photo_url: string;
  alt_text?: string | null;
  sort_order?: number | null;
  review_id?: number | null;
};

type ReviewPhotoChild = {
  id?: number;
  url?: string;
  photo_url?: string;
  photo_urls?: string;
  alt_text?: string | null;
  sort_order?: number | null;
};

type ReviewLike = Review & {
  id?: number;
  review_photos?: ReviewPhotoChild[];
  review_photos_by_review?: ReviewPhotoChild[];
  photo_urls?: string[];
  photo_alt_texts?: Array<string | null | undefined>;
};

function collectReviewerPhotos(reviews: Review[]): PhotoItem[] {
  const rows: PhotoItem[] = [];

  for (const r of reviews ?? []) {
    const review = r as ReviewLike;

    const child = review.review_photos ?? review.review_photos_by_review;

    if (Array.isArray(child) && child.length) {
      for (let i = 0; i < child.length; i++) {
        const p = child[i] ?? {};
        const url = String(p.url || p.photo_url || p.photo_urls || '');
        if (!url || url.trim() === '') continue;

        rows.push({
          id: typeof p.id === 'number' ? p.id : Number(`${review.id ?? 0}${i}`),
          photo_url: url,
          alt_text:
            p.alt_text ?? (r.reviewer_name ? `Photo from ${r.reviewer_name}` : 'Guest photo'),
          sort_order: p.sort_order ?? i,
          review_id: review.id ?? null,
        });
      }
      continue;
    }

    const urls: string[] = Array.isArray(review.photo_urls) ? review.photo_urls : [];
    const alts: Array<string | null | undefined> = Array.isArray(review.photo_alt_texts)
      ? review.photo_alt_texts
      : [];

    for (let i = 0; i < urls.length; i++) {
      const raw = urls[i];
      const url = raw?.startsWith('http')
        ? raw
        : raw
          ? `https://cdn.filestackcontent.com/${raw}`
          : '';

      if (!url || url.trim() === '') continue;

      rows.push({
        id: Number(`${r.id}${i}`),
        photo_url: url,
        alt_text: alts[i] ?? (r.reviewer_name ? `Photo from ${r.reviewer_name}` : 'Guest photo'),
        sort_order: i,
      });
    }
  }

  rows.sort((a, b) => {
    const ao = Number(a.sort_order ?? 0);
    const bo = Number(b.sort_order ?? 0);
    if (ao !== bo) return ao - bo;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  return rows;
}

export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const { result1: hotel, hotel_photos1: photos } = await fetchHotelBySlug(slug);
  if (!hotel) notFound();

  const reviews: Review[] =
    hotel._reviews?.filter((review: Review) => review.hotels_id === hotel.id) ?? [];

  const reviewerPhotoBlobs: PhotoItem[] = collectReviewerPhotos(reviews);

  const avg = getHotelAvg(hotel);
  const count = getHotelCount(hotel);

  const priceLevel = Number(hotel.price_level ?? 0);
  const PRICE_LABELS = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury'];

type RoomCategoryAddon = {
  avg_room_category_rating?: number | string | null;
  room_category_rating_count?: number | string | null;
};

type RoomCategoryLike = Partial<RoomCategory> & {
  room_category_id?: number;
  title?: string;
  avg_room_category_rating?: number | string | null | RoomCategoryAddon;
  room_category_rating_count?: number | string | null;
};

function isRoomCategoryAddon(value: unknown): value is RoomCategoryAddon {
  return typeof value === 'object' && value !== null;
}

function normalizeRoomCategory(rc: RoomCategoryLike): RoomCategory {
  const addon = rc.avg_room_category_rating;

  const avg = isRoomCategoryAddon(addon)
    ? addon.avg_room_category_rating
    : rc.avg_room_category_rating;

  const cnt = isRoomCategoryAddon(addon)
    ? addon.room_category_rating_count
    : rc.room_category_rating_count;

  return {
    ...rc,
    id: rc.id ?? rc.room_category_id ?? 0,
    name: rc.name ?? rc.title ?? 'Unnamed Room Category',
    avg_room_category_rating:
      avg === undefined || avg === null || avg === '' ? null : Number(avg),
    room_category_rating_count:
      cnt === undefined || cnt === null || cnt === '' ? 0 : Number(cnt),
  } as RoomCategory;
}

  const roomCategories: RoomCategory[] = Array.isArray(hotel.room_categories)
    ? hotel.room_categories.map(normalizeRoomCategory)
    : [];
  
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    url: `https://disabilitytraveler.com/hotels/${slug}`,
    image:
      Array.isArray(photos) && photos.length > 0
        ? photos
            .map((p) => p.photo_url)
            .filter((url): url is string => typeof url === 'string' && url.trim() !== '')
        : hotel.featured_image_url
        ? [hotel.featured_image_url]
        : [],
    telephone: hotel.phone_number || hotel.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address || hotel.street_address || undefined,
      addressLocality: hotel.city || undefined,
      addressRegion: hotel.region || undefined,
      addressCountry: hotel.country || undefined,
    },
    aggregateRating:
      avg && count
        ? {
            '@type': 'AggregateRating',
            ratingValue: avg,
            reviewCount: count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.reviewer_name || 'Anonymous',
      },
      reviewBody: review.review_text || '',
      reviewRating:
        review.rating_hotel != null
          ? {
              '@type': 'Rating',
              ratingValue: Number(review.rating_hotel),
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
    })),
  };
    
  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />
      <main className={styles.hotelPageRoot}>
      <div className={styles.hotelPage}>
        {hotel.featured_image_url && (
          <img
            src={hotel.featured_image_url}
            alt={hotel.alt_text || hotel.name || 'Hotel image'}
            className={styles.heroImage}
          />
        )}

        <HotelPhotoGallery
          photos={photos ?? []}
          hotelId={hotel.id}
          reviewerPhotos={reviewerPhotoBlobs}
        />

        <div className={styles.content}>
          <h1 className={styles.hotelName}>🏨 {hotel.name}</h1>

          {priceLevel > 0 && (
            <div
              className={styles.priceBlock}
              aria-label={`Price level ${priceLevel} of 5, ${PRICE_LABELS[priceLevel]}, relative to this location`}
            >
              <div className={styles.priceRow}>
                <span className={styles.dollars} aria-hidden="true">
                  {'$'.repeat(priceLevel)}
                  <span className={styles.dollarsEmpty}>
                    {'$'.repeat(Math.max(0, 5 - priceLevel))}
                  </span>
                </span>
                <span className={styles.priceLabel}>{PRICE_LABELS[priceLevel]}</span>
              </div>
              <div className={styles.priceNote}>(Price level relative to location)</div>
            </div>
          )}

          <p className={styles.ratingText}>
            Average Accessibility Rating:{' '}
            {avg != null ? (
              <>
                {avg.toFixed(1)} <span aria-hidden="true">⭐</span> ({count})
              </>
            ) : (
              'No reviews yet'
            )}
          </p>

          <div className={styles.features}>
            {hotel.has_accessible_pathways && <span className={styles.feature}>🛣️ Accessible Pathways</span>}
            {hotel.has_accessible_restaurant && <span className={styles.feature}>🍽️ Accessible Restaurant</span>}
            {hotel.has_pool_lift && <span className={styles.feature}>🏊 Pool Lift</span>}
            {hotel.has_beach_wheelchair && <span className={styles.feature}>🏖️ Beach Wheelchair</span>}
            {hotel.has_elevator && <span className={styles.feature}>🛗 Elevator</span>}
            {hotel.has_accessible_fitness_center && <span className={styles.feature}> 🏋️ Accessible Fitness Center</span>}
            {hotel.has_service_dog_policy && <span className={styles.feature}>🦮 Service Dogs Welcome</span>}
          </div>

          <div className={styles.reviewButtonContainer}>
            <Link
              href={{
                pathname: '/submit-review',
                query: {
                  hotel: hotel.slug,
                  destination: hotel.destination_slug,
                  redirect: `/hotels/${hotel.slug}`,
                },
              }}
            >
              <button className={styles.reviewButton}>Submit a Review</button>
            </Link>
          </div>

          <hr className={styles.divider} />

          <div className={styles.infoRow}>
            <span>
              <strong>Phone:</strong> {hotel.phone_number}
            </span>
            <span className={styles.dot}>•</span>
            <OutboundLink
              href={hotel.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
              event="outbound_click"
              params={{
                type: 'hotel_website',
                hotel_slug: hotel.slug,
                hotel_id: hotel.id,
              }}
            >
              Visit Hotel Website
            </OutboundLink>
          </div>

          <div className={styles.infoRow}>
            <span>
              <strong>Address:</strong> {hotel.address}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span>
              <strong>Region:</strong> {hotel.region}
            </span>
            <span className={styles.dot}>•</span>
            <span>
              <strong>Country:</strong> {hotel.country}
            </span>
            <span className={styles.dot}>•</span>
            <span>
              <strong>City:</strong> {hotel.city}
            </span>
          </div>

          <hr className={styles.divider} />

          <p className={styles.hotelDescription}>{hotel.description}</p>

          {/* ==== Room categories (filters + cards) ==== */}
          <section className={styles.roomCategoriesSection}>
            <h3 className={styles.sectionTitle}>Accessible Room Categories</h3>
            <p className={styles.disclaimer}>
              We only list room categories that have accessible versions. Displayed photos are
              examples and may not reflect the features of an accessible room.
            </p>

            {/* Renders filters + the grid in one place (no duplicates) */}
            <RoomAmenitiesSection roomCategories={roomCategories} />
          </section>

          {/* ===== Hotel features (bullets) ===== */}
          {hotel.accessibility_features && (
            <section>
              <h2 className={styles.sectionTitle}>Additional Accessibility Information</h2>
              <ul className={styles.bulletList}>
                {hotel.accessibility_features
                  .split('\n')
                  .filter((line: string) => line.trim() !== '')
                  .map((line: string, idx: number) => (
                    <li key={idx}>{line.trim()}</li>
                  ))}
              </ul>
            </section>
          )}

          {/* ==== Reviews ==== */}
          {Array.isArray(reviews) && reviews.length > 0 ? (
            <section>
              <h2 className={styles.sectionTitle}>Traveler Reviews</h2>

              {reviews.map((review: Review) => (
                <article
                  key={review.id}
                  id={`review-${review.id}`}           // <- anchor used by scrollToReview()
                  className={styles.reviewCardWrapper} // optional wrapper class
               >
                  <ReviewCard review={review} />
               </article>
             ))}
           </section>
          ) : (
            <p className={styles.noReviews}>No reviews yet for this hotel.</p>
         )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
