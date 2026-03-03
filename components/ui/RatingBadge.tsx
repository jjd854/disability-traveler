// components/ui/RatingBadge.tsx
// remove: import cx from "classnames";
const cx = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");

type Props = {
  avg?: number | null;
  count?: number | null;
  label?: string;
  decimals?: 0 | 1 | 2;
  showIcon?: boolean;
  className?: string;
  compact?: boolean;
};

export default function RatingBadge({
  avg,
  count = 0,
  label = "Average Accessibility Rating:",
  decimals = 1,
  showIcon = true,
  className,
  compact = false,
}: Props) {
  const hasAvg = typeof avg === "number";
  return (
    <p className={cx(className, compact && "rating-compact")}>
      {label}{" "}
      {hasAvg ? (
        <>
          {avg!.toFixed(decimals)} {showIcon && <span aria-hidden="true">⭐</span>} ({count ?? 0})
        </>
      ) : (
        "No reviews yet"
      )}
    </p>
  );
}

