import React from 'react';
import Link from 'next/link';
import styles from './HotelCard.module.css';
import RatingBadge from '../ui/RatingBadge';

type MaybeNum = number | string | null | undefined;
type MaybeBool = boolean | number | string | null | undefined;

type ReviewLike = {
  rating_hotel?: MaybeNum;
};

interface HotelCardProps {
  id: number;
  name: string;
  slug: string;
  featured_image_url: string;
  alt_text?: string;
  price_level?: number | string | null;

  has_pool_lift?: MaybeBool;
  has_beach_wheelchair?: MaybeBool;
  has_elevator?: MaybeBool;
  has_accessible_pathways?: MaybeBool;
  has_accessible_restaurant?: MaybeBool;
  has_accessible_fitness_center?: MaybeBool;
  has_service_dog_policy?: MaybeBool;
  is_all_inclusive?: MaybeBool;

  avg_hotel_rating?: MaybeNum;
  hotel_review_count?: MaybeNum;
  hotel_avg_rating?: { average_hotel_rating?: MaybeNum } | null;
  _hotel_avg_rating?: { average_hotel_rating?: MaybeNum } | null;

  hotel_avgreview_and_count?: {
    avg_hotel_rating?: MaybeNum;
    hotel_review_count?: MaybeNum;
  } | null;

  _reviews?: ReviewLike[] | null;
  __reviews?: ReviewLike[] | null;
  reviews?: ReviewLike[] | null;
}

function N(v: MaybeNum): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function B(v: MaybeBool): boolean {
  if (v === true) return true;
  if (v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 't' || s === 'yes';
  }
  return false;
}

const PRICE_LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Economy',
  3: 'Mid-range',
  4: 'Upscale',
  5: 'Luxury',
};

const HotelCard: React.FC<HotelCardProps> = (p) => {
  const { name, slug, featured_image_url, alt_text } = p;

  const avgRaw =
    p.avg_hotel_rating ??
    p.hotel_avgreview_and_count?.avg_hotel_rating ??
    p._hotel_avg_rating?.average_hotel_rating ??
    p.hotel_avg_rating?.average_hotel_rating ??
    null;

  const embedded: ReviewLike[] = [
    Array.isArray(p._reviews) ? p._reviews : [],
    Array.isArray(p.__reviews) ? p.__reviews : [],
    Array.isArray(p.reviews) ? p.reviews : [],
  ].flat();

  const computed = (() => {
    const nums = embedded
      .map((r) => N(r?.rating_hotel))
      .filter((n): n is number => n !== null);

    if (!nums.length) return { avg: null as number | null, count: 0 };

    const sum = nums.reduce((a, b) => a + b, 0);
    return { avg: sum / nums.length, count: nums.length };
  })();

  const avg = avgRaw != null ? N(avgRaw) : computed.avg;
  const count =
    N(p.hotel_review_count) ??
    N(p.hotel_avgreview_and_count?.hotel_review_count) ??
    computed.count;

  const priceLevel = Math.max(0, Math.min(5, N(p.price_level) ?? 0));

  const f_pathways = B(p.has_accessible_pathways);
  const f_restaurant = B(p.has_accessible_restaurant);
  const f_poolLift = B(p.has_pool_lift);
  const f_beachWc = B(p.has_beach_wheelchair);
  const f_elevator = B(p.has_elevator);
  const f_fitness = B(p.has_accessible_fitness_center);
  const isAllInc = B(p.is_all_inclusive);
  const f_serviceDog = B(p.has_service_dog_policy);

  const features = [
    { ok: f_pathways, label: 'Accessible Pathways', emoji: '🛣️' },
    { ok: f_restaurant, label: 'Accessible Restaurant', emoji: '🍽️' },
    { ok: f_fitness, label: 'Accessible Fitness Center', emoji: '🏋️' },
    { ok: f_poolLift, label: 'Pool Lift', emoji: '🏊' },
    { ok: f_beachWc, label: 'Beach Wheelchair', emoji: '🏖️' },
    { ok: f_elevator, label: 'Elevator', emoji: '🛗' },
    { ok: f_serviceDog, label: 'Service dog Welcome', emoji: '🦮' },
  ].filter((f) => f.ok);

  return (
    <div className={styles.card}>
      <img
        src={featured_image_url}
        alt={alt_text || `${name} feature image`}
        className={styles.thumbnail}
        loading="lazy"
      />

      <h3 className={styles.name}>
        {slug ? (
          <Link href={`/hotels/${slug}`} className={styles.nameLink} aria-label={`View ${name}`}>
            {name}
         </Link>
       ) : (
         <span className={styles.nameText}>{name}</span>
       )}

       {isAllInc && <span className={styles.badge}>All-Inclusive</span>}
     </h3>

      {priceLevel > 0 && (
        <p className={styles.priceRow} title="Price level is relative to this destination">
          <span
            className={styles.dollars}
            aria-label={`Price level ${priceLevel} of 5`}
          >
            {'$'.repeat(priceLevel)}
            <span className={styles.dollarsEmpty}>
              {'$'.repeat(Math.max(0, 5 - priceLevel))}
            </span>
          </span>
          <span className={styles.priceLabel}>
            {PRICE_LABELS[priceLevel] ?? ''}
          </span>
        </p>
      )}

      <RatingBadge
        avg={avg}         // your existing computed avg
        count={count}     // your existing count
        className={styles.ratingText}
      />
      <div className={styles.divider} />

      {!!features.length && (
        <div className={styles.features}>
          {features.map((f, i) => (
            <span key={i} className={styles.feature}>
              <span aria-hidden="true" className={styles.featureEmoji}>{f.emoji}</span>
              {f.label}
            </span>
          ))}
        </div>
      )}

      <Link href={`/hotels/${slug}`} className={styles.button}>
        View Hotel
      </Link>
    </div>
  );
};

export default HotelCard;





