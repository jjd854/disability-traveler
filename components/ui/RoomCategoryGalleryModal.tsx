'use client';

import { useEffect, useRef } from 'react';
import styles from './RoomCategoryGalleryModal.module.css';

export type RoomCategoryPhoto = { url: string; alt_text?: string | null };

interface Props {
  photos: RoomCategoryPhoto[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onChangeIndex?: (i: number) => void;
}

export default function RoomCategoryGalleryModal({
  photos,
  startIndex = 0,
  isOpen,
  onClose,
  onChangeIndex,
}: Props) {
  const idxRef = useRef(startIndex);

  useEffect(() => {
    idxRef.current = startIndex;
  }, [startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (photos.length > 1) {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, photos.length]);

  if (!isOpen) return null;

  const current = photos[idxRef.current];

  function next() {
    if (photos.length < 2) return;
    idxRef.current = (idxRef.current + 1) % photos.length;
    onChangeIndex?.(idxRef.current);
  }
  function prev() {
    if (photos.length < 2) return;
    idxRef.current = (idxRef.current + photos.length - 1) % photos.length;
    onChangeIndex?.(idxRef.current);
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Room photos">
      <button className={styles.close} onClick={onClose} aria-label="Close gallery">✕</button>

      <div className={styles.stage}>
        <img
          className={styles.stageImg}
          src={current?.url}
          alt={current?.alt_text || 'Room photo'}
        />
        {photos.length > 1 && (
          <>
            <button className={styles.navLeft} onClick={prev} aria-label="Previous photo">‹</button>
            <button className={styles.navRight} onClick={next} aria-label="Next photo">›</button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className={styles.strip} role="listbox" aria-label="Thumbnails">
          {photos.map((p, i) => {
            const active = i === idxRef.current;
            return (
              <button
                key={i}
                className={`${styles.thumb} ${active ? styles.active : ''}`}
                onClick={() => {
                  idxRef.current = i;
                  onChangeIndex?.(i);
                }}
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-selected={active}
              >
                <img src={p.url} alt={p.alt_text || `Photo ${i + 1}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
