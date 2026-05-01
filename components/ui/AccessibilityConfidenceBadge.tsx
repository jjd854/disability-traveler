import styles from './AccessibilityConfidenceBadge.module.css';

type Props = {
  confidence?: string | null;
  size?: 'default' | 'small';
};

export default function AccessibilityConfidenceBadge({
  confidence,
  size = 'default',
}: Props) {
  if (!confidence) return null;

  let label = '';
  let description = '';
  let className = '';

  switch (confidence) {
    case 'verified_by_hotel':
      label = 'Verified by Hotel';
      description = 'Accessibility details confirmed directly with the hotel.';
      className = 'verified';
      break;

    case 'dt_verified':
      label = 'Disability Traveler Verified';
      description = 'Accessibility details informed by firsthand experience from the Disability Traveler Team at this hotel. Specific room features may vary.';
      className = 'dt';
      break;

    case 'detailed':
      label = 'Detailed Accessibility Info';
      description = 'Accessibility details based on publicly available information, but not verified directly with the hotel.';
      className = 'detailed';
      break;

    case 'limited':
      label = 'Limited Accessibility Info';
      description = 'The hotel states it has accessible features, but detailed property and/or room level information is not shared publicly. Contacting the hotel directly is required.';
      className = 'limited';
      break;

    default:
      return null;
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.confidenceBadge} ${styles[className]} ${size === 'small' ? styles.small : ''}`}
        tabIndex={0}
        aria-describedby={`confidence-tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {label}
      </div>

      <div
        id={`confidence-tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`}
        role="tooltip"
        className={styles.tooltip}
      >
        {description}
      </div>
    </div>
  );
}