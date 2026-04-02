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
      description = 'Accessibility details informed by firsthand experience at the property.';
      className = 'dt';
      break;

    case 'detailed':
      label = 'Detailed Accessibility Info';
      description = 'Based on strong publicly available information, but not confirmed directly with the hotel.';
      className = 'detailed';
      break;

    case 'limited':
      label = 'Limited Accessibility Info';
      description = 'The hotel reports accessible features, but detailed room-level information is limited.';
      className = 'limited';
      break;

    default:
      return null;
  }

  return (
    <div
      className={`${styles.confidenceBadge} ${styles[className]} ${size === 'small' ? styles.small : ''}`}
      title={description}
    >
      {label}
    </div>
  );
}