'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import HotelCard from '@/components/ui/HotelCard';
import styles from './hotels.module.css';
import hotelCardStyles from '@/components/ui/HotelCard.module.css';
import type { Destination } from '@/lib/types';

// -------- Types --------
type RawDestination = Destination & {
  id?: number | string;
  slug?: string | null;
  name?: string | null;
  Name?: string | null;
  Slug?: string | null;
};

type RawReview = {
  rating_hotel?: number | string | null;
};

type RawRoomCategory = {
  door_32_in?: boolean | string | number | null;
  lowered_bed?: boolean | string | number | null;
  roll_under_vanity?: boolean | string | number | null;
  roll_in_shower?: boolean | string | number | null;
  shower_seat_fixed?: boolean | string | number | null;
  tub_with_bench?: boolean | string | number | null;
  handheld_shower?: boolean | string | number | null;
  bathroom_grab_bars?: boolean | string | number | null;
  turning_radius_60_in?: boolean | string | number | null;
  accessible_balcony?: boolean | string | number | null;
  rollout_patio?: boolean | string | number | null;
  visual_alarm?: boolean | string | number | null;
  hearing_kit_available?: boolean | string | number | null;
};

type RawHotel = {
  id?: number | string;
  name?: string | null;
  Name?: string | null;
  slug?: string | null;
  featured_image_url?: string | null;
  alt_text?: string | null;
  price_level?: number | string | null;
  accessibility_confidence?: string | null;

  avg_hotel_rating?: number | string | null;
  hotel_review_count?: number | string | null;

  hotel_avgreview_and_count?: {
    avg_hotel_rating?: number | string | null;
    hotel_review_count?: number | string | null;
  } | null;

  _hotel_avg_rating?: {
    average_hotel_rating?: number | string | null;
  } | null;

  _reviews?: RawReview[] | null;
  reviews?: RawReview[] | null;

  has_elevator?: boolean | string | number | null;
  has_accessible_pathways?: boolean | string | number | null;
  has_accessible_restaurant?: boolean | string | number | null;
  has_accessible_fitness_center?: boolean | string | number | null;
  has_accessible_meeting_spaces?: boolean | string | number | null;
  has_pool_lift?: boolean | string | number | null;
  has_beach_wheelchair?: boolean | string | number | null;
  is_all_inclusive?: boolean | string | number | null;
  has_service_dog_policy?: boolean | string | number | null;

  room_categories?: RawRoomCategory[] | null;
  _room_categories?: RawRoomCategory[] | null;
  room_categories_addon?: RawRoomCategory[] | null;
};

type NormalizedHotel = {
  id: number;
  name: string;
  slug: string;
  featured_image_url?: string;
  alt_text?: string | null;
  price_level?: number | null;
  accessibility_confidence?: string | null;

  avg_hotel_rating?: number | string | null;
  hotel_review_count?: number | string | null;

  hotel_avgreview_and_count?: {
    avg_hotel_rating?: number | string | null;
    hotel_review_count?: number | string | null;
  } | null;

  _hotel_avg_rating?: {
    average_hotel_rating?: number | string | null;
  } | null;
  _reviews?: RawReview[] | null;

  has_elevator?: boolean;
  has_accessible_pathways?: boolean;
  has_accessible_restaurant?: boolean;
  has_accessible_fitness_center?: boolean;
  has_pool_lift?: boolean;
  has_beach_wheelchair?: boolean;
  has_accessible_meeting_spaces?: boolean;
  is_all_inclusive?: boolean;
  has_service_dog_policy?: boolean;

  room_categories?: RawRoomCategory[];
  _room_categories?: RawRoomCategory[];
  room_categories_addon?: RawRoomCategory[];
};

const PRICE_LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Economy',
  3: 'Mid-range',
  4: 'Upscale',
  5: 'Luxury',
};

// -------- Property amenities --------
const INITIAL_PROP_FILTERS = {
  has_elevator: false,
  has_accessible_pathways: false,
  has_accessible_fitness_center: false,
  has_accessible_meeting_spaces: false,
  has_accessible_restaurant: false,
  has_pool_lift: false,
  has_beach_wheelchair: false,
  has_service_dog_policy: false,
  is_all_inclusive: false,
} as const;

type PropFilters = typeof INITIAL_PROP_FILTERS;

const PROP_FILTER_LABEL_OVERRIDES: Partial<Record<keyof PropFilters, string>> = {
  has_accessible_meeting_spaces: 'Accessible Meeting & Event Spaces',
  has_service_dog_policy: 'Service Dogs Welcome',
};

// -------- Room amenities --------
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
  | 'accessible_balcony'
  | 'rollout_patio'
  | 'visual_alarm'
  | 'hearing_kit_available';

const ROOM_AMENITIES: Array<{ key: RoomAmenKey; label: string }> = [
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
];

// -------- Helpers --------
function boolLike(v: unknown): boolean {
  if (v === true || v === 1) return true;

  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 't' || s === 'yes';
  }

  return false;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asOptionalString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function asNumberOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getDestinationName(dest: RawDestination): string {
  return dest.Name ?? dest.name ?? '';
}

function getDestinationSlug(dest: RawDestination): string {
  const rawSlug = dest.slug ?? dest.Slug;
  if (typeof rawSlug === 'string' && rawSlug.trim()) {
    return rawSlug;
  }

  return getDestinationName(dest)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function pickArrayFrom(obj: unknown): RawHotel[] {
  if (Array.isArray(obj)) return obj as RawHotel[];

  if (obj && typeof obj === 'object') {
    const maybeObj = obj as Record<string, unknown>;

    if (Array.isArray(maybeObj.items)) return maybeObj.items as RawHotel[];
    if (Array.isArray(maybeObj.result)) return maybeObj.result as RawHotel[];
    if (Array.isArray(maybeObj.data)) return maybeObj.data as RawHotel[];

    const resultKey = Object.keys(maybeObj).find((k) => /^result\d*$/.test(k));
    if (resultKey && Array.isArray(maybeObj[resultKey])) {
      return maybeObj[resultKey] as RawHotel[];
    }
  }

  return [];
}

/** TRUE if the hotel has at least one room category that satisfies ALL selected room features */
function hotelHasSelectedRoomFeatures(
  hotel: NormalizedHotel,
  selected: Set<RoomAmenKey>
): boolean {
  if (!selected.size) return true;

  const cats =
    hotel.room_categories ||
    hotel._room_categories ||
    hotel.room_categories_addon ||
    [];

  if (!cats.length) return false;

  return cats.some((cat) =>
    Array.from(selected).every((key) => boolLike(cat?.[key]))
  );
}

// ================= Component =================
export default function HotelsPage() {
  const [destinations, setDestinations] = useState<RawDestination[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
  const [hotels, setHotels] = useState<NormalizedHotel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [propFilters, setPropFilters] = useState<PropFilters>({ ...INITIAL_PROP_FILTERS });
  const hasAnyPropAmenity = Object.values(propFilters).some(Boolean);

  const [priceLevels, setPriceLevels] = useState<Set<number>>(new Set());
  const togglePrice = (lvl: number) =>
    setPriceLevels((prev) => {
      const next = new Set(prev);

      if (next.has(lvl)) {
        next.delete(lvl);
      } else {
        next.add(lvl);
      }

      return next;
    });

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

  const hasAnyRoomAmen = roomAmens.size > 0;

  const clearAll = () => {
    setSearchQuery('');
    setPropFilters({ ...INITIAL_PROP_FILTERS });
    setPriceLevels(new Set());
    setRoomAmens(new Set());
  };

  // Fetch destinations
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/destinations',
          { cache: 'no-store' }
        );

        const data: unknown = await res.json();
        const list = Array.isArray(data) ? (data as RawDestination[]) : [];

        setDestinations(list);

        if (!selectedDestinationId && list.length) {
          setSelectedDestinationId(Number(list[0]?.id));
        }
      } catch {
        setDestinations([]);
      }
    })();
  }, [selectedDestinationId]);

  // Reset filters when destination changes
  useEffect(() => {
    setSearchQuery('');
    setPropFilters({ ...INITIAL_PROP_FILTERS });
    setPriceLevels(new Set());
    setRoomAmens(new Set());
  }, [selectedDestinationId]);

  // Fetch hotels for selected destination
  useEffect(() => {
    if (!selectedDestinationId) {
      setHotels([]);
      return;
    }

    void (async () => {
      try {
        setIsLoading(true);

        const sel = destinations.find(
          (d) => Number(d.id) === Number(selectedDestinationId)
        );

        const slug = sel ? getDestinationSlug(sel) : '';

        const url = new URL(
          'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/hotels'
        );
        url.searchParams.set('destinations_id', String(selectedDestinationId));
        url.searchParams.set('destination_id', String(selectedDestinationId));

        if (slug) {
          url.searchParams.set('destination_slug', slug);
          url.searchParams.set('dest', slug);
          url.searchParams.set('slug', slug);
        }

        const res = await fetch(url.toString(), { cache: 'no-store' });
        const raw: unknown = await res.json();

        const list = pickArrayFrom(raw);

        const normalized: NormalizedHotel[] = list.map((h) => {
          const alias = h.hotel_avgreview_and_count ?? null;

          const reviews: RawReview[] = Array.isArray(h._reviews)
            ? h._reviews
            : Array.isArray(h.reviews)
              ? h.reviews
              : [];
          const nums: number[] = reviews
            .map((r) => Number(r?.rating_hotel))
            .filter((n): n is number => Number.isFinite(n));

          const computedAvg =
            nums.length > 0
              ? nums.reduce((acc, val) => acc + val, 0) / nums.length
              : null;

          return {
            id: Number(h.id),
            name: h.name ?? h.Name ?? '',
            slug: asString(h.slug),
            featured_image_url: h.featured_image_url ?? '/placeholder.jpg',
            alt_text: asOptionalString(h.alt_text),
            price_level: asNumberOrNull(h.price_level),
            accessibility_confidence: asOptionalString(h.accessibility_confidence),

            avg_hotel_rating:
              h.avg_hotel_rating ??
              alias?.avg_hotel_rating ??
              h._hotel_avg_rating?.average_hotel_rating ??
              computedAvg,

            hotel_review_count:
              h.hotel_review_count ??
              alias?.hotel_review_count ??
              reviews.length,

            hotel_avgreview_and_count: alias,

            _hotel_avg_rating: h._hotel_avg_rating ?? null,
            _reviews: reviews,

            has_elevator: boolLike(h.has_elevator),
            has_accessible_pathways: boolLike(h.has_accessible_pathways),
            has_accessible_fitness_center: boolLike(h.has_accessible_fitness_center),
            has_accessible_meeting_spaces: boolLike(h.has_accessible_meeting_spaces),
            has_accessible_restaurant: boolLike(h.has_accessible_restaurant),
            has_pool_lift: boolLike(h.has_pool_lift),
            has_beach_wheelchair: boolLike(h.has_beach_wheelchair),
            has_service_dog_policy: boolLike(h.has_service_dog_policy),
            is_all_inclusive: boolLike(h.is_all_inclusive),

            room_categories: Array.isArray(h.room_categories)
              ? h.room_categories
              : undefined,
            _room_categories: Array.isArray(h._room_categories)
              ? h._room_categories
              : undefined,
            room_categories_addon: Array.isArray(h.room_categories_addon)
              ? h.room_categories_addon
              : undefined,
          };
        });

        setHotels(normalized);
      } catch (e) {
        console.error('Failed to fetch hotels', e);
        setHotels([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedDestinationId, destinations]);

  const filteredHotels = useMemo(() => {
    return (hotels ?? []).filter((h) => {
      const matchesQuery = h.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesProps = Object.entries(propFilters).every(
        ([k, want]) => !want || boolLike(h[k as keyof NormalizedHotel])
      );

      const lvl = h.price_level == null ? null : Number(h.price_level);

      const matchesPrice =
        priceLevels.size === 0 || (lvl != null && priceLevels.has(lvl));

      const matchesRoom = hotelHasSelectedRoomFeatures(h, roomAmens);

      return matchesQuery && matchesProps && matchesPrice && matchesRoom;
    });
  }, [hotels, searchQuery, propFilters, priceLevels, roomAmens]);

  return (
    <>
      <Navbar />
      <section className={styles.confidenceExplainer}>
        <h2 className={styles.confidenceTitle}>Understanding Accessibility Confidence</h2>
        <p className={styles.confidenceIntro}>
          Accessibility Confidence helps you understand how each hotel’s accessibility information was sourced.
        </p>

        <div className={styles.confidenceGrid}>
          <div className={styles.confidenceItem}>
            <span className={`${styles.confidencePill} ${styles.verifiedPill}`}>Verified by Hotel</span>
            <p className={styles.confidenceText}>
               Accessibility details confirmed directly with the hotel.
            </p>
          </div>

          <div className={styles.confidenceItem}>
            <span className={`${styles.confidencePill} ${styles.dtPill}`}>Disability Traveler Verified</span>
            <p className={styles.confidenceText}>
              Accessibility details informed by firsthand experience from the Disability Traveler Team.
            </p>
          </div>

          <div className={styles.confidenceItem}>
            <span className={`${styles.confidencePill} ${styles.detailedPill}`}>Detailed Accessibility Info</span>
            <p className={styles.confidenceText}>
              Accessibility details based on publicly available information, but not verified directly with the hotel.
            </p>
          </div>

          <div className={styles.confidenceItem}>
            <span className={`${styles.confidencePill} ${styles.limitedPill}`}>Limited Accessibility Info</span>
            <p className={styles.confidenceText}>
              The hotel states it has accessible features, but detailed room-level information is not shared publicly. Contacting the hotel directly is required.
            </p>
          </div>
        </div>

        <p className={styles.confidenceNote}>
          We still recommend contacting the hotel directly to confirm details for your specific needs.
        </p>
      </section>
      <main className="page-content">
       <div className={styles.container}>
        <h1 className={styles.pageTitle}>Browse Accessible Hotels</h1>
        <p className={styles.placeholder}>Please select a destination to view accessible hotels.</p>

        <div className={styles.controls}>
          <select
            value={selectedDestinationId ?? ''}
            onChange={e => setSelectedDestinationId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className={styles.dropdown}
            aria-label="Choose a destination"
          >
            <option value="">Choose a destination</option>
            {destinations.map(dest => (
              <option key={dest.id} value={Number(dest.id)}>
                {dest.Name ?? dest.name}
              </option>
            ))}
          </select>

          {selectedDestinationId && (
            <>
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchBar}
                aria-label="Search hotels by name"
              />
              <button onClick={() => setFiltersOpen(p => !p)} className={styles.filterButton}>
                {filtersOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </>
          )}
        </div>

        {filtersOpen && (
          <div className={styles.filtersPanel}>
            {/* Clear all */}
            <div className={styles.filtersToolbar}>
              <button type="button" className={styles.clearLink} onClick={clearAll}>
                Clear all
              </button>
            </div>

            {/* Property Amenities */}
            <fieldset className={styles.filterFieldset}>
              <legend className={styles.filterLegend}>Property Amenities</legend>
              <div className={`${styles.fieldsetRow} ${styles.stackOnMobile}`}>
                {Object.entries(INITIAL_PROP_FILTERS).map(([key]) => {
                  const checked = propFilters[key as keyof PropFilters];
                  const label =
                    PROP_FILTER_LABEL_OVERRIDES[key as keyof PropFilters] ??
                    key
                      .replace(/^has_/, '')
                      .replace(/^is_/, '')
                      .replace(/_/g, ' ')
                      .replace('all inclusive', 'all-inclusive')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                  return (
                    <label key={key} className={styles.chip}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setPropFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                        }
                      />
                      {label}
                    </label>
                  );
                })}
                {hasAnyPropAmenity && (
                  <button
                    type="button"
                    className={styles.clearLink}
                    onClick={() => setPropFilters({ ...INITIAL_PROP_FILTERS })}
                  >
                    Clear
                  </button>
                )}
              </div>
            </fieldset>

            {/* Room Amenities */}
            <fieldset className={styles.filterFieldset}>
              <legend className={styles.filterLegend}>Room Amenities</legend>
              <div className={`${styles.fieldsetRow} ${styles.stackOnMobile}`}>
                {ROOM_AMENITIES.map((a) => {
                  const active = roomAmens.has(a.key);
                  return (
                    <label key={a.key} className={styles.chip}>
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
                  <button type="button" className={styles.clearLink} onClick={() => setRoomAmens(new Set())}>
                    Clear
                  </button>
                )}
              </div>
            </fieldset>

            {/* Price */}
            <fieldset className={styles.filterFieldset}>
              <legend className={styles.filterLegend}>Price</legend>
              <div className={styles.fieldsetRow}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <label key={lvl} className={styles.chip}>
                    <input
                      type="checkbox"
                      checked={priceLevels.has(lvl)}
                      onChange={() => togglePrice(lvl)}
                    />
                    <span className={styles.dollars} aria-hidden="true">
                      {'$'.repeat(lvl)}
                      <span className={styles.dollarsEmpty}>{'$'.repeat(5 - lvl)}</span>
                    </span>
                    <span className={styles.priceLabel}>{PRICE_LABELS[lvl]}</span>
                  </label>
                ))}
                {priceLevels.size > 0 && (
                  <button type="button" className={styles.clearLink} onClick={() => setPriceLevels(new Set())}>
                    Clear
                  </button>
                )}
              </div>
            </fieldset>
          </div>
        )}

        {!selectedDestinationId && (
          <p className={styles.placeholder}>Please select a destination to view accessible hotels.</p>
        )}
        {selectedDestinationId && isLoading && <p className={styles.placeholder}>Loading hotels...</p>}

        {selectedDestinationId && !isLoading && (
          filteredHotels.length ? (
            <div className={styles.hotelGrid}>
              {filteredHotels.map((hotel) => (
                <div key={hotel.id} className={hotelCardStyles.hotelcardWrapper}>
                  <HotelCard
                    id={hotel.id}
                    name={hotel.name}
                    slug={hotel.slug}
                    accessibility_confidence={hotel.accessibility_confidence}
                    featured_image_url={hotel.featured_image_url ?? '/placeholder.jpg'}
                    alt_text={hotel.alt_text ?? undefined}
                    price_level={hotel.price_level ?? null}
                    avg_hotel_rating={hotel.avg_hotel_rating}
                    hotel_review_count={hotel.hotel_review_count}
                    hotel_avgreview_and_count={hotel.hotel_avgreview_and_count}
                    _hotel_avg_rating={hotel._hotel_avg_rating}
                    __reviews={hotel._reviews}
                    has_accessible_pathways={hotel.has_accessible_pathways}
                    has_accessible_restaurant={hotel.has_accessible_restaurant}
                    has_pool_lift={hotel.has_pool_lift}
                    has_beach_wheelchair={hotel.has_beach_wheelchair}
                    has_elevator={hotel.has_elevator}
                    has_accessible_fitness_center={hotel.has_accessible_fitness_center}
                    has_accessible_meeting_spaces={hotel.has_accessible_meeting_spaces}
                    has_service_dog_policy={hotel.has_service_dog_policy}
                    is_all_inclusive={hotel.is_all_inclusive}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.placeholder}>No hotels match your current filters.</p>
          )
        )}
       </div>
      </main> 
      <Footer />
    </>
  );
}
