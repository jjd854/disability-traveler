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
import AccessibilityConfidenceBadge from '@/components/ui/AccessibilityConfidenceBadge';

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

const PROPERTY_FEATURE_ORDER = [
  'has_accessible_pathways',
  'has_elevator',
  'has_pool_lift',
  'has_beach_wheelchair',
  'has_accessible_restaurant',
  'has_accessible_fitness_center',
  'has_accessible_meeting_spaces',
  'has_service_dog_policy',
] as const;

const PROPERTY_FEATURE_CHIP_LABELS: Record<string, string> = {
  has_accessible_pathways: 'Accessible Pathways',
  has_accessible_restaurant: 'Accessible Restaurant',
  has_pool_lift: 'Pool Lift',
  has_beach_wheelchair: 'Beach Wheelchair',
  has_elevator: 'Elevator',
  has_accessible_fitness_center: 'Accessible Fitness Center',
  has_accessible_meeting_spaces: 'Accessible Meeting & Event Spaces',
  has_service_dog_policy: 'Service Dogs Welcome',
};

const PROPERTY_FEATURE_SENTENCE_LABELS: Record<string, string> = {
  has_accessible_pathways: 'accessible pathways',
  has_accessible_restaurant: 'accessible restaurants',
  has_pool_lift: 'pool lifts',
  has_beach_wheelchair: 'beach wheelchairs',
  has_elevator: 'elevators',
  has_accessible_fitness_center: 'accessible fitness center',
  has_accessible_meeting_spaces: 'accessible meeting and event spaces',
  has_service_dog_policy: 'service dogs are welcome',
};

const ROOM_FEATURE_ORDER = [
  'door_32_in',
  'roll_in_shower',
  'tub_with_bench',
  'fixed_shower_seat',
  'handheld_shower',
  'bathroom_grab_bars',
  'roll_under_vanity',
  'turning_radius_60_in',
  'lowered_bed',
  'bed_clearance_underframe',
  'accessible_balcony',
  'rollout_patio',
  'visual_alarm',
  'hearing_kit_available',
] as const;

const ROOM_FEATURE_CHIP_LABELS: Record<string, string> = {
  door_32_in: '32" Door',
  roll_in_shower: "Roll-In Shower",
  tub_with_bench: "Tub with Bench",
  bathroom_grab_bars: "Bathroom Grab Bars",
  fixed_shower_seat: "Fixed Shower Seat",
  handheld_shower: "Handheld Shower",
  roll_under_vanity: "Roll-Under Vanity",
  turning_radius_60_in: "60-inch Turning Radius",
  lowered_bed: "Lowered Bed",
  bed_clearance_underframe: "Bed Clearance Under Bed",
  accessible_balcony: "Accessible Balcony",
  rollout_patio: "Ground Floor Patio",
  visual_alarm: "Visual Alarm",
  hearing_kit_available: "Hearing Accessibile or Kit",
};

const ROOM_FEATURE_SENTENCE_LABELS: Record<string, string> = {
  door_32_in: '32-inch doorways',
  roll_in_shower: "roll-in showers",
  tub_with_bench: "bathtubs with benches",
  bathroom_grab_bars: "bathroom grab bars",
  fixed_shower_seat: "fixed shower seats",
  handheld_shower: "handheld shower heads",
  roll_under_vanity: "roll-under vanities",
  turning_radius_60_in: "60-inch turning radius space",  
  lowered_bed: "lowered beds",
  bed_clearance_underframe: "bed clearance for lifts",
  accessible_balcony: "accessible balconies",
  rollout_patio: "ground floor patios",
  visual_alarm: "visual alarm systems",
  hearing_kit_available: "hearing accessibile rooms or kits",
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

  const propertyFeatures = Object.entries(hotel)
    .filter(
      ([key, value]) =>
        PROPERTY_FEATURE_CHIP_LABELS[key] && value === true
    )
    .map(([key]) => key);

  const orderedPropertyFeatures = PROPERTY_FEATURE_ORDER.filter((feature) =>
    propertyFeatures.includes(feature)
  );

  const propertyFeatureList = orderedPropertyFeatures
    .map((feature) => PROPERTY_FEATURE_CHIP_LABELS[feature])
    .filter(Boolean);

  const propertySentenceFeatureList = orderedPropertyFeatures
    .map((feature) => PROPERTY_FEATURE_SENTENCE_LABELS[feature])
    .filter(Boolean);

  const propertyFeatureSentence = formatFeatureList(propertySentenceFeatureList);

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

  const roomFeatures = Array.from(
    new Set(
      roomCategories.flatMap((room) =>
        Object.entries(room)
          .filter(([key, value]) => ROOM_FEATURE_CHIP_LABELS[key] && value === true)
          .map(([key]) => key)
      )
    )
  );

  const orderedRoomFeatures = ROOM_FEATURE_ORDER.filter((feature) =>
    roomFeatures.includes(feature)
  );

  const featureList = orderedRoomFeatures
    .map((feature) => ROOM_FEATURE_CHIP_LABELS[feature])
    .filter(Boolean);

  const sentenceFeatureList = orderedRoomFeatures
    .map((feature) => ROOM_FEATURE_SENTENCE_LABELS[feature])
    .filter(Boolean);

  const featureSentence = formatFeatureList(sentenceFeatureList);

  function formatFeatureList(list: string[]) {
    if (list.length === 0) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} and ${list[1]}`;
    return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
  } 

  const hotelBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://disabilitytraveler.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://disabilitytraveler.com/destinations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: hotel.Name || 'Destination',
        item: `https://disabilitytraveler.com/destinations/${hotel.Destinations?.slug || ''}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: hotel.name,
        item: `https://disabilitytraveler.com/hotels/${slug}`,
      },
    ],
  };
    
  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelBreadcrumbSchema) }}
      />
      <main className={styles.hotelPageRoot}>
      <div className={styles.hotelPage}>
        {hotel.featured_image_url && (
          <>
            <img
              src={hotel.featured_image_url}
              alt={hotel.alt_text || hotel.name || 'Hotel image'}
              className={styles.heroImage}
            />

            {hotel.is_placeholder_image === false && (
              <p className={styles.photoAttribution}>
                Photo courtesy of {hotel.name}
              </p>
            )}
          </>
        )}

        <HotelPhotoGallery
          photos={photos ?? []}
          hotelId={hotel.id}
          reviewerPhotos={reviewerPhotoBlobs}
          hotelName={hotel.name}
        />

        <div className={styles.content}>
          <h1 className={styles.hotelName}>🏨 {hotel.name}</h1>
          <AccessibilityConfidenceBadge confidence={hotel.accessibility_confidence} />
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
                {hotel.is_all_inclusive && (
                  <span className={styles.allInclusive}>
                    •  All-Inclusive
                  </span>
                )}   
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
          <h2 className={styles.propertyaccessibilityText}>Accessible Features at This Hotel</h2>
          <div className={styles.features}>
            {hotel.has_accessible_pathways && <span className={styles.feature}>🛣️ Accessible Pathways</span>}
            {hotel.has_accessible_restaurant && <span className={styles.feature}>🍽️ Accessible Restaurant</span>}
            {hotel.has_pool_lift && <span className={styles.feature}>🏊 Pool Lift</span>}
            {hotel.has_beach_wheelchair && <span className={styles.feature}>🏖️ Beach Wheelchair</span>}
            {hotel.has_elevator && <span className={styles.feature}>🛗 Elevator</span>}
            {hotel.has_accessible_fitness_center && <span className={styles.feature}> 🏋️ Accessible Fitness Center</span>}
            {hotel.has_accessible_meeting_spaces && <span className={styles.feature}>🏢 Accessible Meeting & Event Spaces</span>}
            {hotel.has_service_dog_policy && <span className={styles.feature}>🦮 Service Dogs Welcome</span>}
          </div>
          {propertyFeatureSentence && (
            <p className={styles.featureSummary}>
              The {hotel.name} offers several property accessibility features including {propertyFeatureSentence}.
            </p>
          )}

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

          <div className={styles.hotelDescription}>
            {hotel.description
              ?.split('\n')
              .filter((p: string) => p.trim() !== '')
              .map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>

          <h2 className={styles.roomaccessibilityText}>Accessible Room Features Available at This Hotel</h2>
          <div className={styles.chipContainer}>
            {featureList.map((feature) => (
              <span key={feature} className={styles.chip}>
                {feature}
              </span>
            ))}
          </div>
          <p className={styles.featureSummary}>
            Travelers looking for wheelchair accessible hotels in {hotel.city || hotel.Destinations?.name} will find that the {hotel.name} offers accessible guest rooms and multiple accessibility features.
          </p>
          {featureSentence && (
             <p className={styles.featureSummary}>
                Accessible rooms at the {hotel.name} include features such as {featureSentence}.
             </p>
           )}

          {/* ==== Room categories (filters + cards) ==== */}
          <section className={styles.roomCategoriesSection}>
            <h3 className={styles.sectionTitle}>Accessible Room Categories</h3>
            <p className={styles.disclaimer}>
              We only list room categories that have accessible versions. Displayed photos are
              examples and may not reflect the features of an accessible room.
            </p>

            {/* Renders filters + the grid in one place (no duplicates) */}
            {roomCategories && roomCategories.length > 0 ? (
             <RoomAmenitiesSection roomCategories={roomCategories} />
           ) : (
             <div className={styles.noRoomsMessage}>
               The hotel reports that accessible rooms are available; however, it does not
               publicly specify which room categories offer accessible accommodations.
               Travelers may need to contact the hotel directly to confirm availability.
             </div>
           )}
          </section>

          {/* ===== Hotel features (bullets) ===== */}
          {hotel.accessibility_features && (
            <section>
              <h2 className={styles.sectionTitle}>Accessibility Notes & Considerations</h2>
              <ul className={styles.bulletList}>

                {/* DT VERIFIED - ROOM */}
                {hotel.dt_verified_room_notes && (
                  <li className={styles.dtVerified}>
                    <strong>DT Verified (Room):</strong> {hotel.dt_verified_room_notes}
                  </li>
                )}

                {/* DT VERIFIED - PROPERTY */}
                {hotel.dt_verified_property_notes && (
                  <li className={styles.dtVerified}>
                    <strong>DT Verified (Property):</strong> {hotel.dt_verified_property_notes}
                  </li>
                )}

                {/* EXISTING NOTES */}
                {hotel.accessibility_features
                  .split('\n')
                  .filter((line: string) => line.trim() !== '')
                  .map((line: string, idx: number) => (
                    <li key={idx}>{line.trim()}</li>
                  ))
                }

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
