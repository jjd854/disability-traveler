import styles from './AccessibilityConfidenceBadge.module.css';

type Props = {
  confidence?: string | null;
  verifiedDate?: string | null;
  size?: 'default' | 'small';
};

export default function AccessibilityConfidenceBadge({
  confidence,
  verifiedDate,
  size = 'default',
}: Props) {
  if (!confidence) return null;

  let label = '';
  let description = '';
  let className = '';

  switch (confidence) {
    case 'verified_by_hotel':
      label = 'Verified by Hotel';
      description = verifiedDate
        ? `Accessibility information reviewed and confirmed directly with the hotel in ${verifiedDate}.`
        : 'Accessibility information reviewed and confirmed directly with the hotel.';
      className = 'verified';
      break;

    case 'dt_verified':
      label = 'Disability Traveler Verified';
      description = verifiedDate
        ? `Accessibility information informed by firsthand experience from the Disability Traveler team during a visit in ${verifiedDate}. Specific room features may vary.`
        : 'Accessibility information informed by firsthand experience from the Disability Traveler team. Specific room features may vary.';
      className = 'dt';
      break;

    case 'detailed':
      label = 'Detailed Accessibility Info';
      description =
        'Accessibility details based on publicly available information, but not verified directly with the hotel.';
      className = 'detailed';
      break;

    case 'limited':
      label = 'Limited Accessibility Info';
      description =
        'The hotel states it has accessible features, but detailed property and/or room-level information is not shared publicly. Contacting the hotel directly is required.';
      className = 'limited';
      break;

    default:
      return null;
  }

  const tooltipId = `confidence-tooltip-${label
    .replace(/\s+/g, '-')
    .toLowerCase()}`;

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.confidenceBadge} ${styles[className]} ${
          size === 'small' ? styles.small : ''
        }`}
        tabIndex={0}
        aria-describedby={tooltipId}
      >
        {label}
      </div>

      <div
        id={tooltipId}
        role="tooltip"
        className={styles.tooltip}
      >
        {description}
      </div>
    </div>
  );
}