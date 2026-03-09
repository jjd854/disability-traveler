'use client';

import { useMemo, useState } from 'react';
import styles from './ReviewCard.module.css';
import { ReviewCardProps } from '@/lib/types';
import Link from 'next/link';

type ReviewPhotoLike = {
  id?: number | string | null;
  url?: string | null;
  alt_text?: string | null;
  sort_order?: number | string | null;
};

type ReviewLikeForPhotos = {
  review_photos?: ReviewPhotoLike[] | null;
  photo_urls?: string[] | null;
  photo_alt_texts?: Array<string | null | undefined> | null;
};

function normalizePhotos(review: ReviewLikeForPhotos): { url: string; alt: string }[] {
  if (Array.isArray(review?.review_photos) && review.review_photos.length) {
    return review.review_photos
      .filter((p) => p && p.url)
      .slice()
      .sort((a, b) => {
        const ao = Number(a.sort_order ?? 0);
        const bo = Number(b.sort_order ?? 0);
        if (ao !== bo) return ao - bo;
        return Number(a.id ?? 0) - Number(b.id ?? 0);
      })
      .map((p) => ({
        url: String(p.url),
        alt: String(p.alt_text ?? ''),
      }));
  }

  if (Array.isArray(review?.photo_urls) && review.photo_urls.length) {
    return review.photo_urls
      .map((url: string, i: number) => ({
        url,
        alt: review.photo_alt_texts?.[i] ?? '',
      }))
      .filter((p) => p.url && String(p.url).trim() !== '');
  }

  return [];
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const photos = useMemo(
    () => normalizePhotos(review as ReviewLikeForPhotos),
    [review]
  );

  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const currentPhoto = modalIndex !== null ? photos[modalIndex] : null;
  const [expanded, setExpanded] = useState(false);

  const rd = Math.max(0, Math.min(5, Number(review.rating_destination ?? 0)));
  const rh = Math.max(0, Math.min(5, Number(review.rating_hotel ?? 0)));

  const roomCategoryName: string | null =
    review?.review_room_category?.name ||
    review?.room_category?.name ||
    review?.room_category_name ||
    null;

  const hasRcr =
    review?.room_category_rating != null && review?.room_category_rating !== '';
  const rcrRaw = Number(review?.room_category_rating ?? 0);
  const rcr = Math.max(0, Math.min(5, rcrRaw));

  const hotelWriteIn = (review?.hotel_write_in ?? '').toString().trim();
  const didntStay = !!review?.didnt_stay_overnight;

  const listedHotelName = (review?.review_hotels?.name ?? '').toString().trim();
  const listedHotelSlug = (review?.review_hotels?.slug ?? '').toString().trim();

  const hasListedHotel =
    !!listedHotelSlug && listedHotelName.toLowerCase() !== 'not listed';

  const hotelRatingNum =
    review?.rating_hotel == null ? null : Number(review.rating_hotel);

  const hasHotelRating =
    hasListedHotel &&
    hotelRatingNum != null &&
    !Number.isNaN(hotelRatingNum) &&
    hotelRatingNum > 0;

  const hasDestinationRating =
    review?.rating_destination != null &&
    Number(review.rating_destination) > 0;

  const showRoomCategory = hasListedHotel && !didntStay;


  return (
    <div className={styles.card}>
      <p className={styles.meta}>
        <strong>Reviewer Name:</strong> {review.reviewer_name}
      </p>
      <p className={styles.meta}>
        <strong>Date:</strong>{' '}
        {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
      </p>

      <div className={styles.metaLine}>
        <span className={styles.metaItem}>
          <strong>Destination:</strong>{' '}
          {review.destinations?.slug ? (
            <Link
              href={`/destinations/${review.destinations.slug}`}
              className={styles.link}
           >
              {review.destinations?.Name || 'N/A'}
           </Link>
         ) : (
           review.destinations?.Name || 'N/A'
         )}
       </span>

       <span className={styles.metaDivider}>|</span>

              <span className={styles.metaItem}>
                <strong>Hotel:</strong>{' '}
                {didntStay ? (
                  'No Hotel Stay (day trip, cruise stop, local)'
                ) : hotelWriteIn ? (
                  <>
                    {hotelWriteIn} <em>(Not Listed)</em>
                  </>
                ) : review.review_hotels?.slug &&
                  review.review_hotels?.name?.toLowerCase() !== 'not listed' ? (
                  <Link href={`/hotels/${review.review_hotels.slug}`} className={styles.link}>
                    {review.review_hotels?.name}
                 </Link>
                ) : (
                  'Not Listed'
                )}
              </span>
     </div>

     {/* Room category line (clicks through to the hotel page for now) */}
          {showRoomCategory && (roomCategoryName || hasRcr) && (
       <p className={styles.meta}>
         <strong>Room Category:</strong>{' '}
         {review.review_hotels?.slug ? (
           <Link
             href={`/hotels/${review.review_hotels.slug}`}
             className={styles.link}
           >
             {roomCategoryName || '—'}
           </Link>
         ) : (
           roomCategoryName || '—'
         )}
       </p>
     )}

      <div className={styles.ratingsRow}>
  {hasDestinationRating && (
    <span className={styles.ratingsItem}>
      <span className={styles.ratingLabel}>
        <strong>Destination Accessibility Rating:</strong>
      </span>
      <span className={`${styles.star} ${styles.stars}`}>
        <span className={styles.filledStar}>{'★'.repeat(rd)}</span>
        <span className={styles.emptyStar}>{'☆'.repeat(5 - rd)}</span>
      </span>
    </span>
  )}


  {hasHotelRating && (  
    <span className={styles.ratingsItem}>
      <span className={styles.ratingLabel}>
        <strong>Hotel Accessibility Rating:</strong>
      </span>
      <span className={`${styles.star} ${styles.stars}`}>
        <span className={styles.filledStar}>{'★'.repeat(rh)}</span>
        <span className={styles.emptyStar}>{'☆'.repeat(5 - rh)}</span>
      </span>
    </span>
  )}

  {showRoomCategory && hasRcr && (
    <span className={styles.ratingsItem}>
      <span className={styles.ratingLabel}>
        <strong>Room Category Accessibility Rating:</strong>
      </span>
      <span className={`${styles.star} ${styles.stars}`}>
        <span className={styles.filledStar}>{'★'.repeat(rcr)}</span>
        <span className={styles.emptyStar}>{'☆'.repeat(5 - rcr)}</span>
      </span>
    </span>
  )}
</div>


      <div className={styles.reviewText}>
        {(expanded
          ? review.review_text
          : review.review_text.slice(0, 200) +
            (review.review_text.length > 200 ? '...' : '')
       )
          .split(/\n\s*\n/) // split on blank lines
          .map((para, idx) => (
            <p key={idx} className={styles.reviewParagraph}>
              {para}
           </p>
          ))}

        {review.review_text.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={styles.readMore}
          >
            {expanded ? 'Read less' : 'Read more'}
         </button>
        )}
     </div>


      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className={styles.photoScroller}>
          <div className={styles.thumbnailRow} role="list">
            {photos.map((p, idx) => (
              <button
                key={p.url + idx}
                type="button"
                className={styles.thumbBtn}
                onClick={() => setModalIndex(idx)}
                aria-label={`Open review photo ${idx + 1} of ${photos.length}`}
             >
                <img
                  src={p.url}
                  alt={p.alt || `Review photo ${idx + 1}`}
                  className={styles.thumbnail}
                  loading="lazy"
                />
             </button>
           ))}
         </div>
       </div>
     )}


      {/* Modal */}
      {modalIndex !== null && currentPhoto && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalIndex(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-roledescription="carousel"
            aria-label="Review photos"
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.alt || 'Full size review photo'}
              className={styles.modalImage}
            />

            <button
              className={`${styles.navBtn} ${styles.leftArrow}`}
              onClick={() => setModalIndex(Math.max(0, modalIndex - 1))}
              disabled={modalIndex === 0}
              aria-label="Previous photo"
            >
              ‹
            </button>

            <button
              className={`${styles.navBtn} ${styles.rightArrow}`}
              onClick={() =>
                setModalIndex(Math.min(photos.length - 1, modalIndex + 1))
              }
              disabled={modalIndex === photos.length - 1}
              aria-label="Next photo"
            >
              ›
            </button>

            <button
              className={styles.closeButton}
              onClick={() => setModalIndex(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {currentPhoto.alt && (
              <p className={styles.altText}>{currentPhoto.alt}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


