'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './RoomCategoryCard.module.css';
import type { RoomCategory, RoomCategoryPhoto } from '@/lib/types';
import RatingBadge from '../ui/RatingBadge';
import AccessibilityConfidenceBadge from './AccessibilityConfidenceBadge';
import Image from "next/image";

interface Props {
  category: RoomCategory;
  hotelName?: string;
  photoCredit?: string | null;
}

type RoomCategoryAddon = {
  avg_room_category_rating?: number | string | null;
  room_category_rating_count?: number | string | null;
};

type RoomCategoryPhotoLike = {
  id?: number | string;
  url?: string;
  photo_url?: string;
  alt_text?: string | null;
  hotel_name?: { name: string } | null;
  is_placeholder_image?: boolean;
  photo_credit?: string | null;
};

type RoomCategoryLike = RoomCategory & {
  avg_room_category_rating?: number | string | null | RoomCategoryAddon;
  room_category_rating_count?: number | string | null;
  accessibility_confidence?: string | null;
  verified_date?: string | null;

  photos_example?: RoomCategoryPhotoLike[] | null;

  door_32_in?: boolean | number | string | null;
  roll_in_shower?: boolean | number | string | null;
  bathroom_grab_bars?: boolean | number | string | null;
  roll_under_vanity?: boolean | number | string | null;
  shower_seat_fixed?: boolean | number | string | null;
  tub_with_bench?: boolean | number | string | null;
  handheld_shower?: boolean | number | string | null;
  lowered_bed?: boolean | number | string | null;
  turning_radius_60_in?: boolean | number | string | null;
  accessible_balcony?: boolean | number | string | null;
  rollout_patio?: boolean | number | string | null;
  visual_alarm?: boolean | number | string | null;
  hearing_kit_available?: boolean | number | string | null;
  bed_clearance_underframe?: number | string | null;
};

function isAddon(value: unknown): value is RoomCategoryAddon {
  return typeof value === 'object' && value !== null;
}

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export default function RoomCategoryCard({ category, hotelName, photoCredit }: Props) {
  const cat = category as RoomCategoryLike;

  // --- pull avg + count from either flat or nested add-on shapes ---
  const addon = cat.avg_room_category_rating;

  const avgRaw = isAddon(addon)
    ? addon.avg_room_category_rating
    : cat.avg_room_category_rating;

  const countRaw = isAddon(addon)
    ? addon.room_category_rating_count
    : cat.room_category_rating_count;

  const avg =
    avgRaw === undefined || avgRaw === null || avgRaw === '' ? null : Number(avgRaw);

  const count =
    countRaw === undefined || countRaw === null || countRaw === '' ? 0 : Number(countRaw);

  // Normalize + de-dupe photos (by url) and fall back gracefully
  const photos = useMemo<RoomCategoryPhoto[]>(() => {
    const raw: RoomCategoryPhotoLike[] = Array.isArray(cat.photos_example)
      ? cat.photos_example
      : [];

    const normalized: RoomCategoryPhoto[] = raw
      .map((p, i) => ({
        id: p.id ?? i,
        url: p.url || p.photo_url || '',
        alt_text:
          p.alt_text ||
          (typeof cat.name === 'string'
            ? `${cat.name} – photo ${i + 1}`
            : `Room photo ${i + 1}`),
        is_placeholder_image: isTruthyFlag(p.is_placeholder_image),    
      }))
      .filter((p) => typeof p.url === 'string' && p.url.trim() !== '');

    const seen = new Set<string>();
    const unique: RoomCategoryPhoto[] = [];

       for (const p of normalized) {
         if (!seen.has(p.url)) {
           seen.add(p.url);
           unique.push(p);
         }
       }

       // Exclude placeholder images from the photo gallery
       return unique.filter((p) => !p.is_placeholder_image);
     }, [cat.photos_example, cat.name]);

  // Features / chips
  const chips: string[] = [];
  if (isTruthyFlag(cat.door_32_in)) chips.push('32" doorway');
  if (isTruthyFlag(cat.roll_in_shower)) chips.push('Roll-in shower');
  if (isTruthyFlag(cat.bathroom_grab_bars)) chips.push('Bathroom grab bars');
  if (isTruthyFlag(cat.roll_under_vanity)) chips.push('Roll-under vanity');
  if (isTruthyFlag(cat.shower_seat_fixed)) chips.push('Shower seat (fixed)');
  if (isTruthyFlag(cat.tub_with_bench)) chips.push('Accessible tub');
  if (isTruthyFlag(cat.handheld_shower)) chips.push('Handheld shower');
  if (isTruthyFlag(cat.lowered_bed)) chips.push('Lowered bed');
  if (isTruthyFlag(cat.turning_radius_60_in)) chips.push('60" turning radius');
  if (isTruthyFlag(cat.accessible_balcony)) chips.push('Accessible balcony');
  if (isTruthyFlag(cat.rollout_patio)) chips.push('Ground floor patio');
  if (isTruthyFlag(cat.visual_alarm)) chips.push('Visual alarm');
  if (isTruthyFlag(cat.hearing_kit_available)) chips.push('Hearing accessible or kit');

  if (cat.bed_clearance_underframe !== undefined && cat.bed_clearance_underframe !== null) {
    chips.push(`Bed clearance: ${cat.bed_clearance_underframe}"`);
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen, isClient]);

  const hasPhotos = photos.length > 0;
  const active = hasPhotos ? photos[activeIndex % photos.length] : null;

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasPhotos) return;
    setActiveIndex((i) => (i + 1) % photos.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasPhotos) return;
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  const showAttribution = photos.some(
    (photo) => photo.is_placeholder_image !== true
  );

  useEffect(() => {
    if (!modalOpen) return;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setModalOpen(false);
      if (ev.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % photos.length);
      if (ev.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, photos.length]);

  return (
    <>
      <div className={styles.card}>
        {/* THUMBNAIL */}
        <div
          className={styles.thumbnailContainer}
          onClick={() => hasPhotos && setModalOpen(true)}
          role={hasPhotos ? "button" : undefined}
          aria-label={hasPhotos ? "Open room photos" : undefined}
          tabIndex={hasPhotos ? 0 : undefined}
          onKeyDown={(e) => {
            if (hasPhotos && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setModalOpen(true);
            }
          }}
        >
          <div className={styles.thumbnailWrapper}>
            {!active || active.is_placeholder_image ? (
              <div className={styles.thumbnailPlaceholder}>
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="10" width="18" height="9" rx="1" />
                  <path d="M3 15h18M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
                  <path d="M6 19v2M18 19v2" />
                </svg>

                <span className={styles.placeholderTitle}>
                  Room Photography Unavailable
                </span>
              </div>
            ) : (
              <Image
                src={active!.url}
                alt={active!.alt_text || `${category.name} room photo`}
                fill
                className={styles.thumbnail}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.chevron} ${styles.left}`}
                onClick={prev}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.chevron} ${styles.right}`}
                onClick={next}
                aria-label="Next photo"
              >
                ›
              </button>
              <div className={styles.dots} aria-hidden="true">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={
                      i === activeIndex
                        ? `${styles.dot} ${styles.dotActive}`
                        : styles.dot
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <h4 className={styles.title}>{category.name}</h4>
          <AccessibilityConfidenceBadge
            confidence={category.accessibility_confidence}
            verifiedDate={category.verified_date}
            size="small"
          />
          <RatingBadge
            avg={avg}
            count={count}
            compact
            className={styles.ratingText}
          />
          <div className={styles.divider} />
            <div className={styles.chips}>
              {chips.length > 0 ? (
                chips.map((label, i) => (
                  <span key={i} className={styles.chip}>
                    <span className={styles.chipIcon} aria-hidden="true">•</span>
                    {label}
                  </span>
                ))
              ) : (
                <span className={styles.noFeatures}>
                  Accessibility details not provided by hotel
                </span>
              )}
            </div>
        </div>
      </div>

      {/* MODAL via PORTAL */}
      {isClient && modalOpen && hasPhotos && createPortal(
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-label={`${category.name} photos`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.modalArrow} ${styles.modalLeft}`}
                  onClick={prev}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.modalArrow} ${styles.modalRight}`}
                  onClick={next}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}

            <div className={styles.modalStage}>
              <Image
                className={styles.modalImage}
                src={photos[activeIndex].url}
                alt={
                  photos[activeIndex].alt_text ||
                  `${category.name} photo ${activeIndex + 1}`
                }
                width={1600}
                height={900}
                sizes="100vw"
              />
           </div>

           <div className={styles.modalCaption}>
             {category.name} — {activeIndex + 1} / {photos.length}
           </div>
            {showAttribution && (
              <p className={styles.photoAttribution}>
                Photos courtesy of {photoCredit || hotelName}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

