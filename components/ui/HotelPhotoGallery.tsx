'use client';

import { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './HotelPhotoGallery.module.css';

type PhotoItem = {
  id?: number;
  url?: string;
  photo_url?: string;
  photo_urls?: string;
  alt_text?: string | null;
  sort_order?: number | null;
  review_id?: number | null;    // 👈 NEW: link back to review
};

type NormalizedPhoto = {
  id: number;
  photo_url: string;
  alt_text: string | null;
  sort_order: number | null;
  review_id?: number | null;    // 👈 NEW
};

interface HotelPhotoGalleryProps {
  photos: PhotoItem[];              // hotel (management) photos
  reviewerPhotos?: PhotoItem[];     // flattened reviewer photos
  hotelId?: number;
}

function normalize(items: PhotoItem[]): NormalizedPhoto[] {
  const toUrl = (p: PhotoItem) => p.url || p.photo_url || p.photo_urls || '';
  return (items ?? [])
    .map(p => ({
      id: p.id ?? 0,
      photo_url: String(toUrl(p) || ''),
      alt_text: p.alt_text ?? null,
      sort_order: p.sort_order ?? null,
      review_id: p.review_id ?? null,   // 👈 carry review id through
    }))
    .filter(p => p.photo_url.trim() !== '')
    .sort((a, b) => {
      const ao = Number(a.sort_order ?? 0);
      const bo = Number(b.sort_order ?? 0);
      if (ao !== bo) return ao - bo;
      return (a.id ?? 0) - (b.id ?? 0);
    });
}

export default function HotelPhotoGallery({
  photos,
  reviewerPhotos = [],
}: HotelPhotoGalleryProps) {
  const hotelNorm = useMemo(() => normalize(photos), [photos]);
  const reviewerNorm = useMemo(() => normalize(reviewerPhotos), [reviewerPhotos]);

  const hasReviewer = reviewerNorm.length > 0;

  const [isOpen, setIsOpen] = useState(false);
  const [showReviewerPhotos, setShowReviewerPhotos] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedPhotos = showReviewerPhotos && hasReviewer ? reviewerNorm : hotelNorm;

  // 👇 NEW: scroll to the matching review card
  const scrollToReview = (reviewId?: number | null) => {
    if (!reviewId) return;

    // Close modal first
    setIsOpen(false);

    // Scroll after modal has started closing
    setTimeout(() => {
      const el = document.getElementById(`review-${reviewId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <>
      <button
        className={styles.openButton}
        onClick={() => { setIsOpen(true); setCurrentIndex(0); }}
      >
        📷 View All Photos
      </button>

      {isOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              aria-label="Close photo gallery"
            >
              ×
            </button>

            {/* Toggle buttons */}
            <div className={styles.toggleRow}>
              <button
                className={!showReviewerPhotos ? styles.activeToggle : ''}
                onClick={() => { setShowReviewerPhotos(false); setCurrentIndex(0); }}
                type="button"
              >
                Hotel Photos ({hotelNorm.length})
              </button>

              <button
                className={showReviewerPhotos ? styles.activeToggle : ''}
                onClick={() => { setShowReviewerPhotos(true); setCurrentIndex(0); }}
                type="button"
                disabled={!hasReviewer}
                aria-disabled={!hasReviewer}
                title={!hasReviewer ? 'No reviewer photos yet' : 'Show reviewer photos'}
              >
                Reviewer Photos ({reviewerNorm.length})
              </button>
            </div>

            {/* Swiper */}
            <Swiper
              key={(showReviewerPhotos ? 'reviewer' : 'hotel') + '-' + selectedPhotos.length}
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className={styles.photoSwiper}
              initialSlide={currentIndex}
              onSlideChange={(s) => setCurrentIndex(s.realIndex)}
              spaceBetween={10}
              slidesPerView={1}
            >
              {selectedPhotos.map((photo, idx) => (
                <SwiperSlide key={photo.photo_url + idx}>
                  <img
                    src={photo.photo_url}
                    alt={photo.alt_text || 'Photo'}
                    className={styles.photo}
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Caption for reviewer photos */}
            {showReviewerPhotos && selectedPhotos[currentIndex] && (
              <div className={styles.captionContainer}>
                {selectedPhotos[currentIndex].alt_text ? (
                  <button
                    type="button"
                    className={styles.captionLink}  // 👈 add simple styling in CSS
                    onClick={() => scrollToReview(selectedPhotos[currentIndex].review_id)}
                  >
                    {selectedPhotos[currentIndex].alt_text}
                  </button>
                ) : (
                  <p className={styles.caption}>No description provided</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}









