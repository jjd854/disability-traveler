'use client';

import styles from './ReviewTipsModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewTipsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>What makes a helpful accessibility review?</h2>
        <p className={styles.subtitle}>
          Your review helps travelers understand what it’s actually like to navigate this place with a disability.
        </p>

        <div className={styles.columns}>
          <div className={styles.section}>
            <h3>Do</h3>
            <ul>
              <li>Be specific about accessibility features you encountered (ramps, curb cuts, shower type, bed height, pool lift, etc.).</li>
              <li>Describe what the destination, hotel or room could do to be more accessible.</li>
              <li>Share what worked and what didn’t.</li>
              <li>Include some normal trip info (food, vibe, good or bad trip overall).</li>
              <li>Add tips you’d tell a friend.</li>
              <li>Upload up to 5 helpful photos.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>Don’t</h3>
            <ul>
              <li>Guess about accessibility.</li>
              <li>Share secondhand experiences.</li>
              <li>Post personal contact information.</li>
              <li>Attack individuals.</li>
            </ul>
          </div>
        </div>

        <p className={styles.footer}>
          Reviews should reflect your direct experience as a traveler with a disability,
          or as a caregiver/guardian/travel companion who was present.
        </p>
      </div>
    </div>
  );
}
