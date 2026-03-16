'use client';

import { useMemo, useState } from 'react';
import HotelCard from '@/components/ui/HotelCard';
import hotelStyles from '../../hotels/hotels.module.css'; // reuse your hotels CSS
import hotelCardStyles from '@/components/ui/HotelCard.module.css';


type Hotel = unknown;

const PRICE_LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Economy',
  3: 'Mid-range',
  4: 'Upscale',
  5: 'Luxury',
};

/** ---------- Property amenities (booleans on Hotels table) ---------- */
const INITIAL_PROP_FILTERS = {
  has_elevator: false,
  has_accessible_pathways: false,
  has_accessible_meeting_spaces: false,
  has_accessible_fitness_center: false,
  has_accessible_restaurant: false,
  has_pool_lift: false,
  has_beach_wheelchair: false,
  is_all_inclusive: false,
  has_service_dog_policy: false,
} as const;
type PropFilters = typeof INITIAL_PROP_FILTERS;

const PROP_FILTER_LABEL_OVERRIDES: Record<string, string> = {
  has_accessible_meeting_spaces: 'Accessible Meeting & Event Spaces',
  has_service_dog_policy: 'Service Dogs Welcome',
};

/** ---------- Room amenities (JSON on room_categories.features_json) ---------- */
type RoomAmenKey =
  | 'door_32_in'
  | 'lowered_bed'
  | 'roll_under_vanity'
  | 'roll_in_shower'
  | 'shower_seat_fixed'
  | 'tub_with_bench'
  | 'handheld_shower'
  | 'bathroom_grab_bars'
  | 'turning_radius_60_in'
  | 'visual_alarm'
  | 'hearing_kit_available';

const ROOM_AMENITIES: { key: RoomAmenKey; label: string }[] = [
  { key: 'door_32_in', label: '32" Door' },
  { key: 'lowered_bed', label: 'Lowered Bed' },
  { key: 'roll_under_vanity', label: 'Roll Under Vanity' },
  { key: 'roll_in_shower', label: 'Roll-In Shower' },
  { key: 'shower_seat_fixed', label: 'Fixed Shower Seat' },
  { key: 'tub_with_bench', label: 'Tub with Bench' },
  { key: 'handheld_shower', label: 'Handheld Shower' },
  { key: 'bathroom_grab_bars', label: 'Bathroom Grab Bars' },
  { key: 'turning_radius_60_in', label: '60" Turning Radius' },
  { key: 'visual_alarm', label: 'Visual Alarm' },
  { key: 'hearing_kit_available', label: 'Hearing Accessible or Kit' },
];

/** Robust truthiness for 1/0/"true"/true */
function boolLike(v: unknown): boolean {
  if (v === true || v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 't' || s === 'yes';
  }
  return false;
}

/** A hotel passes if ANY category has ALL selected room features true */
function hotelHasSelectedRoomFeatures(
  hotel: unknown,
  selected: Set<string>
): boolean {
  if (!selected.size) return true;

  // Narrow the unknown into a record so you can index by string keys
  const h = hotel as Record<string, unknown>;
  const cats: unknown[] = [
    ...(Array.isArray(h.room_categories) ? (h.room_categories as unknown[]) : []),
    ...(Array.isArray(h._room_categories) ? (h._room_categories as unknown[]) : []),
    ...(Array.isArray(h.room_categories_addon) ? (h.room_categories_addon as unknown[]) : []),
  ];
  if (!cats.length) return false;

  return cats.some(cat => {
    const record = cat as Record<string, unknown>;
    return Array.from(selected).every(key => {
      const value = record[key];
      return value === true || value === 'true';
    });
  });
}

interface Props {
  destinationName: string;
  hotels: Hotel[];
}

export default function DestinationHotels({ destinationName, hotels }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Property filters
  const [propFilters, setPropFilters] = useState<PropFilters>({ ...INITIAL_PROP_FILTERS });
  const clearPropFilters = () => setPropFilters({ ...INITIAL_PROP_FILTERS });
  const hasAnyPropAmenity = Object.values(propFilters).some(Boolean);

  // Price filters
  const [priceLevels, setPriceLevels] = useState<Set<number>>(new Set());
  const togglePrice = (lvl: number) => {
    setPriceLevels((prev) => {
       const next = new Set(prev);

      if (next.has(lvl)) {
        next.delete(lvl);
      } else {
        next.add(lvl);
      }

      return next;
    });
  };

  // Room amenities (as a Set of keys)
  const [roomAmens, setRoomAmens] = useState<Set<RoomAmenKey>>(new Set());
  const toggleRoomAmen = (key: RoomAmenKey) =>
    setRoomAmens((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  const clearRoomAmens = () => setRoomAmens(new Set());
  const hasAnyRoomAmen = roomAmens.size > 0;

  // ---- Clear all handler (now that hooks exist) ----
  const clearAll = () => {
    setSearchQuery('');
    setPropFilters({ ...INITIAL_PROP_FILTERS });
    setPriceLevels(new Set());
    setRoomAmens(new Set());
  };
  
  type HotelLike = {
  id: number | string;

  name?: string | null;
  Name?: string | null; // some records have capitalized keys
  slug?: string | null;

  featured_image_url?: string | null;
  alt_text?: string | null;

  price_level?: number | string | null;

  avg_hotel_rating?: number | null;
  hotel_review_count?: number | null;
  hotel_avgreview_and_count?: unknown; // keep loose for now
  _hotel_avg_rating?: number | null;
  _reviews?: unknown; // keep loose for now

  // Property amenities / booleans
  has_accessible_pathways?: boolean | null;
  has_accessible_restaurant?: boolean | null;
  has_pool_lift?: boolean | null;
  has_beach_wheelchair?: boolean | null;
  has_elevator?: boolean | null;
  has_accessible_fitness_center?: boolean | null;
  has_accessible_meeting_spaces?: boolean | null;
  is_all_inclusive?: boolean | null;
  has_service_dog_policy?: boolean | null;

  // Room-related filters you had earlier
  has_roll_in_shower?: boolean | null;
  has_lowered_bed?: boolean | null;
  has_32_doorway?: boolean | null;
  has_tub_with_bench?: boolean | null;
};

const hotelsList = useMemo<HotelLike[]>(
  () => (Array.isArray(hotels) ? (hotels as HotelLike[]) : []),
  [hotels]
);
  const filteredHotels = useMemo(() => {
    return hotelsList.filter((h) => {
      // Search by name
      const nm = (h.name ?? h.Name ?? '').toString().toLowerCase();
      const matchesQuery = !searchQuery || nm.includes(searchQuery.toLowerCase());

      // Property amenities: all selected must be true on the hotel
      type PropKey = keyof HotelLike;

      const matchesProps = Object.entries(propFilters).every(([k, want]) => {
        if (!want) return true;
        const key = k as PropKey;
        return boolLike(h[key]);
      });

      // Price
      const lvlRaw = h.price_level == null ? null : Number(h.price_level);
      const matchesPrice = priceLevels.size === 0 || (lvlRaw != null && priceLevels.has(lvlRaw));

      // Room amenities
      const matchesRoom = hotelHasSelectedRoomFeatures(h, roomAmens);

      return matchesQuery && matchesProps && matchesPrice && matchesRoom;
    });
  }, [hotelsList, searchQuery, propFilters, priceLevels, roomAmens]);

  return (
    <>
      <div className={hotelStyles.controls}>
        <input
          type="text"
          placeholder="Search hotels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={hotelStyles.searchBar}
          aria-label={`Search hotels in ${destinationName}`}
        />
        <button
          onClick={() => setFiltersOpen((p) => !p)}
          className={hotelStyles.filterButton}
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {filtersOpen && (
        <div className={hotelStyles.filtersPanel}>
          {/* Clear all toolbar */}
          <div className={hotelStyles.filtersToolbar}>
            <button type="button" className={hotelStyles.clearLink} onClick={clearAll}>
              Clear all
            </button>
          </div>

          {/* Property Amenities */}
          <fieldset className={hotelStyles.filterFieldset}>
            <legend className={hotelStyles.filterLegend}>Property Amenities</legend>
            <div className={`${hotelStyles.fieldsetRow} ${hotelStyles.stackOnMobile}`}>
              {Object.entries(propFilters).map(([key, value]) => (
                <label key={key} className={hotelStyles.chip}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      setPropFilters((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof prev],
                      }))
                    }
                  />
                  {PROP_FILTER_LABEL_OVERRIDES[key] ??
                    key
                      .replace(/^has_/, '')
                      .replace(/^is_/, '')
                      .replace(/_/g, ' ')
                      .replace('all inclusive', 'all-inclusive')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
              ))}
              {hasAnyPropAmenity && (
                <button
                  type="button"
                  className={hotelStyles.clearLink}
                  onClick={clearPropFilters}
                >
                  Clear
                </button>
              )}
            </div>
          </fieldset>

          {/* Room Amenities */}
          <fieldset className={hotelStyles.filterFieldset}>
            <legend className={hotelStyles.filterLegend}>Room Amenities</legend>
            <div className={`${hotelStyles.fieldsetRow} ${hotelStyles.stackOnMobile}`}>
              {ROOM_AMENITIES.map((a) => {
                const active = roomAmens.has(a.key);
                return (
                  <label key={a.key} className={hotelStyles.chip}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleRoomAmen(a.key)}
                    />
                    {a.label}
                  </label>
                );
              })}
              {hasAnyRoomAmen && (
                <button
                  type="button"
                  className={hotelStyles.clearLink}
                  onClick={clearRoomAmens}
                >
                  Clear
                </button>
              )}
            </div>
          </fieldset>

          {/* Price */}
          <fieldset className={hotelStyles.filterFieldset}>
            <legend className={hotelStyles.filterLegend}>Price</legend>
            <div className={hotelStyles.fieldsetRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <label key={lvl} className={hotelStyles.chip}>
                  <input
                    type="checkbox"
                    checked={priceLevels.has(lvl)}
                    onChange={() => togglePrice(lvl)}
                  />
                  <span className={hotelStyles.dollars} aria-hidden="true">
                    {'$'.repeat(lvl)}
                    <span className={hotelStyles.dollarsEmpty}>{'$'.repeat(5 - lvl)}</span>
                  </span>
                  <span className={hotelStyles.priceLabel}>{PRICE_LABELS[lvl]}</span>
                </label>
              ))}
              {priceLevels.size > 0 && (
                <button
                  type="button"
                  className={hotelStyles.clearLink}
                  onClick={() => setPriceLevels(new Set())}
                >
                  Clear
                </button>
              )}
            </div>
          </fieldset>
        </div>
      )}

    <div className={hotelStyles.hotelGrid}>
      {filteredHotels.map((hotel) => (
        <div key={hotel.id} className={hotelCardStyles.hotelcardWrapper}>
          <HotelCard
            id={Number(hotel.id)}
            name={hotel.name ?? ''}
            slug={hotel.slug ?? ''}
            featured_image_url={hotel.featured_image_url ?? '/placeholder.jpg'}
            alt_text={hotel.alt_text ?? undefined}
            price_level={hotel.price_level ?? null}
            avg_hotel_rating={hotel.avg_hotel_rating}
            hotel_review_count={hotel.hotel_review_count}
            has_accessible_pathways={hotel.has_accessible_pathways}
            has_accessible_restaurant={hotel.has_accessible_restaurant}
            has_pool_lift={hotel.has_pool_lift}
            has_beach_wheelchair={hotel.has_beach_wheelchair}
            has_elevator={hotel.has_elevator}
            has_accessible_fitness_center={hotel.has_accessible_fitness_center}
            has_accessible_meeting_spaces={hotel.has_accessible_meeting_spaces}
            is_all_inclusive={hotel.is_all_inclusive}
            has_service_dog_policy={hotel.has_service_dog_policy}
          />
        </div>
      ))}
    </div>
    </>
  );
}
