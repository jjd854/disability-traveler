'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './RoomCategoryCard.module.css';
import type { RoomCategory, RoomCategoryPhoto } from '@/lib/types';
import RatingBadge from "../ui/RatingBadge";

interface Props {
  category: RoomCategory;
}

export default function RoomCategoryCard({ category }: Props) {
  // --- pull avg + count from either flat or nested add-on shapes ---
  const addon = (category as any)?.avg_room_category_rating;

  const avgRaw =
    typeof addon === 'object'
      ? addon?.avg_room_category_rating
      : (category as any)?.avg_room_category_rating;

  const countRaw =
    typeof addon === 'object'
      ? addon?.room_category_rating_count
      : (category as any)?.room_category_rating_count;

  const avg =
    avgRaw === undefined || avgRaw === null || avgRaw === '' ? null : Number(avgRaw);
  const count =
    countRaw === undefined || countRaw === null || countRaw === '' ? 0 : Number(countRaw);

  // Normalize + de-dupe photos (by url) and fall back gracefully
  const photos = useMemo<RoomCategoryPhoto[]>(() => {
    const raw: RoomCategoryPhoto[] = Array.isArray(category.photos_example)
      ? category.photos_example
      : [];

    const normalized = raw
      .map((p, i) => ({
        id: (p as any).id ?? i,
        url: (p as any).url || (p as any).photo_url || '',
        alt_text:
          p.alt_text ||
          (typeof category.name === 'string'
            ? `${category.name} – photo ${i + 1}`
            : `Room photo ${i + 1}`),
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
    return unique;
  }, [category.photos_example, category.name]);

  // Features / chips
  const chips: string[] = [];
  if ((category as any).door_32_in)              chips.push('32" doorway');
  if ((category as any).roll_in_shower)          chips.push('Roll-in shower');
  if ((category as any).bathroom_grab_bars)      chips.push('Bathroom grab bars');
  if ((category as any).roll_under_vanity)       chips.push('Roll-under vanity');
  if ((category as any).shower_seat_fixed)       chips.push('Shower seat (fixed)');
  if ((category as any).tub_with_bench)          chips.push('Tub with bench');
  if ((category as any).handheld_shower)         chips.push('Handheld shower');
  if ((category as any).lowered_bed)             chips.push('Lowered bed');
  if ((category as any).turning_radius_60_in)    chips.push('60\" turning radius');
  if ((category as any).visual_alarm)            chips.push('Visual alarm');
  if ((category as any).hearing_kit_available)   chips.push('Hearing accessibility kit');
  if (typeof (category as any).bed_clearance_underframe === 'number')
    chips.push(`Bed clearance: ${(category as any).bed_clearance_underframe}"`);


  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // NEW: portal guard (only render portal in the browser)
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // (nice to have) lock body scroll while modal is open
  useEffect(() => {
    if (!isClient) return;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
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

  // Close on ESC in modal
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setModalOpen(false);
      if (ev.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % photos.length);
      if (ev.key === 'ArrowLeft')  setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
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
          role="button"
          aria-label="Open room photos"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setModalOpen(true);
          }}
        >
          {hasPhotos ? (
            <>
              <img
                className={styles.thumbnail}
                src={active!.url}
                alt={active!.alt_text || `${category.name} room photo`}
              />
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
                            ? `${styles.dot} ${styles.dotActive}`  // base + active
                            : styles.dot                           // base only
                          }
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.noPhoto}>No photos available</div>
          )}
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <h4 className={styles.title}>{category.name}</h4>
          <RatingBadge
            avg={avg}
            count={count}
            compact
            className={styles.ratingText}
          />
          <div className={styles.divider} />
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((label, i) => (
                <span key={i} className={styles.chip}>
                  <span className={styles.chipIcon} aria-hidden="true">•</span>
                  {label}
                </span>
              ))}
            </div>
          )}
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
              <img
                className={styles.modalImage}
                src={photos[activeIndex].url}
                alt={
                  photos[activeIndex].alt_text ||
                  `${category.name} – photo ${activeIndex + 1}`
                }
              />
           </div>

           <div className={styles.modalCaption}>
             {category.name} — {activeIndex + 1} / {photos.length}
           </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

