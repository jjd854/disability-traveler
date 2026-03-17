'use client';

import { useCallback, useMemo, useState } from 'react';
import RoomCategoryCard from '@/components/ui/RoomCategoryCard';
import type { RoomCategory } from '@/lib/types';
import pageStyles from '@/app/hotels/[slug]/page.module.css';
import filterStyles from '@/components/ui/RoomAmenityFilters.module.css';

type FeatureKey =
  | 'door_32_in'
  | 'lowered_bed'
  | 'roll_under_vanity'
  | 'roll_in_shower'
  | 'shower_seat_fixed'
  | 'tub_with_bench'
  | 'handheld_shower'
  | 'bathroom_grab_bars'
  | 'turning_radius_60_in'
  | 'accessible_balcony'
  | 'rollout_patio'
  | 'visual_alarm'
  | 'hearing_kit_available'
  | 'bed_clearance_underframe';

const ROOM_FEATURES: Array<{ key: FeatureKey; label: string }> = [
  { key: 'door_32_in', label: '32" Door' },
  { key: 'lowered_bed', label: 'Lowered Bed' },
  { key: 'roll_under_vanity', label: 'Roll Under Vanity' },
  { key: 'roll_in_shower', label: 'Roll-In Shower' },
  { key: 'shower_seat_fixed', label: 'Fixed Shower Seat' },
  { key: 'tub_with_bench', label: 'Tub with Bench' },
  { key: 'handheld_shower', label: 'Handheld Shower' },
  { key: 'bathroom_grab_bars', label: 'Bathroom Grab Bars' },
  { key: 'turning_radius_60_in', label: '60" Turning Radius' },
  { key: 'accessible_balcony', label: 'Accessible Balcony' },
  { key: 'rollout_patio', label: 'Ground Floor Patio' },
  { key: 'visual_alarm', label: 'Visual Alarm' },
  { key: 'hearing_kit_available', label: 'Hearing Accessible or Kit' },
  { key: 'bed_clearance_underframe', label: 'Bed Clearance Underframe' },
];

type RoomCategoryLike = RoomCategory & {
  features_json?: Partial<Record<FeatureKey, unknown>> | null;
} & Partial<Record<FeatureKey, unknown>>;

function asBool(v: unknown): boolean {
  return v === true || v === 'true';
}

export default function RoomAmenitiesSection({
  roomCategories,
}: {
  roomCategories: RoomCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<FeatureKey>>(new Set());

  const toggleSelected = useCallback((key: FeatureKey) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const hasFlag = useCallback((rc: RoomCategoryLike, k: FeatureKey) => {
    return asBool(rc.features_json?.[k]) || asBool(rc[k]);
  }, []);

  const filtered = useMemo(() => {
    if (selected.size === 0) return roomCategories;

    const keys = Array.from(selected);
    return roomCategories.filter((rc) =>
      keys.every((k) => hasFlag(rc as RoomCategoryLike, k))
    );
  }, [roomCategories, selected, hasFlag]);

  return (
    <section>
      <div className={filterStyles.center}>
        <button
          type="button"
          className={`${filterStyles.toggleBtnGreen} ${open ? filterStyles.toggleBtnGreenOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-pressed={open}
        >
          {open ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {open && (
        <div className={filterStyles.filtersPanel}>
          <fieldset className={filterStyles.filterFieldset}>
            <legend className={filterStyles.filterLegend}>Room Amenities</legend>

            <div className={`${filterStyles.fieldsetRow} ${filterStyles.stackOnMobile}`}>
              {ROOM_FEATURES.map(({ key, label }) => {
                const checked = selected.has(key);

                return (
                  <label key={key} className={filterStyles.chip}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(key)}
                    />
                    {label}
                  </label>
                );
              })}

              {selected.size > 0 && (
                <button
                  type="button"
                  className={filterStyles.clearLink}
                  onClick={clearAll}
                >
                  Clear
                </button>
              )}
            </div>
          </fieldset>
        </div>
      )}

      <div className={pageStyles.roomCategoriesGrid}>
        {filtered.map((rc) => (
          <RoomCategoryCard key={rc.id} category={rc} />
        ))}
      </div>
    </section>
  );
}