'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import HotelCard from '@/components/ui/HotelCard';
import styles from './hotels.module.css';
import type { Destination } from '@/lib/types';
import hotelCardStyles from '@/components/ui/HotelCard.module.css';

// -------- Types --------
type RawHotel = any;

type NormalizedHotel = {
  id: number;
  name: string;
  slug: string;
  featured_image_url?: string;
  alt_text?: string | null;
  price_level?: number | null;

  avg_hotel_rating?: number | string | null;
  hotel_review_count?: number | string | null;

  hotel_avgreview_and_count?: {
    avg_hotel_rating?: number | string | null;
    hotel_review_count?: number | string | null;
  } | null;

  _hotel_avg_rating?: { average_hotel_rating?: number | string | null } | null;
  _reviews?: any[] | null;

  has_elevator?: boolean;
  has_accessible_pathways?: boolean;
  has_accessible_restaurant?: boolean;
  has_accessible_fitness_center?: boolean;
  has_pool_lift?: boolean;
  has_beach_wheelchair?: boolean;
  is_all_inclusive?: boolean;
  has_service_dog_policy?: boolean;

  room_categories?: any[];
  _room_categories?: any[];
  room_categories_addon?: any[];
};

const PRICE_LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Economy',
  3: 'Mid-range',
  4: 'Upscale',
  5: 'Luxury',
};

// -------- Property amenities (booleans on Hotels table) --------
const INITIAL_PROP_FILTERS = {
  has_elevator: false,
  has_accessible_pathways: false,
  has_accessible_fitness_center: false,
  has_accessible_restaurant: false,
  has_pool_lift: false,
  has_beach_wheelchair: false,
  has_service_dog_policy: false,
  is_all_inclusive: false,
} as const;
type PropFilters = typeof INITIAL_PROP_FILTERS;

// -------- Room amenities (JSON on room_categories.features_json) --------
type RoomAmenKey =
  | 'door_32_in'
  | 'lowered_bed'
  | 'roll_under_vanity'
  | 'roll_in_shower'
  | 'shower_seat_fixed'      // change if your data uses 'shower_seat'
  | 'tub_with_bench'
  | 'handheld_shower'
  | 'bathroom_grab_bars'
  | 'turning_radius_60_in'   // change if your data uses 'clear_floor_space'
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
  { key: 'hearing_kit_available', label: 'Hearing Kit' },
];

// -------- Helpers --------
function boolLike(v: any): boolean {
  if (v === true || v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 't' || s === 'yes';
  }
  return false;
}

/** TRUE if the hotel has at least one room category that satisfies ALL selected room features */
function hotelHasSelectedRoomFeatures(hotel: NormalizedHotel, selected: Set<RoomAmenKey>): boolean {
  if (!selected.size) return true;

  const cats = hotel.room_categories || hotel._room_categories || hotel.room_categories_addon || [];

  if (!cats.length) return false;

  return cats.some((cat: any) =>
    Array.from(selected).every((key) => {
      const value = cat?.[key];
      return value === true || value === 'true' || value === 1;
    })
  );
}



// ================= Component =================
export default function HotelsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
  const [hotels, setHotels] = useState<NormalizedHotel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // property filters
  const [propFilters, setPropFilters] = useState<PropFilters>({ ...INITIAL_PROP_FILTERS });
  const hasAnyPropAmenity = Object.values(propFilters).some(Boolean);

  // price filters
  const [priceLevels, setPriceLevels] = useState<Set<number>>(new Set());
  const togglePrice = (lvl: number) =>
    setPriceLevels(prev => {
      const next = new Set(prev);
      next.has(lvl) ? next.delete(lvl) : next.add(lvl);
      return next;
    });

  // room amenities
  const [roomAmens, setRoomAmens] = useState<Set<RoomAmenKey>>(new Set());
  const toggleRoomAmen = (key: RoomAmenKey) =>
    setRoomAmens(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const hasAnyRoomAmen = roomAmens.size > 0;

  // Clear all
  const clearAll = () => {
    setSearchQuery('');
    setPropFilters({ ...INITIAL_PROP_FILTERS });
    setPriceLevels(new Set());
    setRoomAmens(new Set());
  };

  // Fetch destinations
  useEffect(() => {
  (async () => {
    try {
      const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/destinations', { cache: 'no-store' });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setDestinations(list);
      if (!selectedDestinationId && list.length) {
        setSelectedDestinationId(Number((list[0] as any).id));
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
  // Fetch hotels for selected destination
useEffect(() => {
  if (!selectedDestinationId) {
    setHotels([]);
    return;
  }

  (async () => {
    try {
      setIsLoading(true);

      // derive slug (some stacks want it)
      const sel = destinations.find(d => Number(d.id) === Number(selectedDestinationId));
      const slug =
        (sel as any)?.slug ??
        (sel as any)?.Slug ??
        ((sel as any)?.Name || (sel as any)?.name || '')
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

      // be liberal with param names so it works with your Xano stack
      const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/hotels');
      url.searchParams.set('destinations_id', String(selectedDestinationId));
      url.searchParams.set('destination_id', String(selectedDestinationId));
      if (slug) {
        url.searchParams.set('destination_slug', slug);
        url.searchParams.set('dest', slug);
        url.searchParams.set('slug', slug);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      const raw = await res.json();
      console.log('[Hotels] raw response:', raw);

      // handle [], {items:[]}, {result:[]}, {data:[]}
      // handle [], {items:[]}, {result:[]}, {data:[]}, and Xano's {result1:[]}
      const pickArrayFrom = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj;
        if (obj && Array.isArray(obj.items)) return obj.items;
        if (obj && Array.isArray(obj.result)) return obj.result;
        if (obj && Array.isArray(obj.data)) return obj.data;

        // NEW: handle result1 / result2 / ... patterns
        if (obj && typeof obj === 'object') {
          const key = Object.keys(obj).find((k) => /^result\d*$/.test(k));
          if (key && Array.isArray((obj as any)[key])) return (obj as any)[key];
       }
       return [];
     };

     const list: RawHotel[] = pickArrayFrom(raw);
     console.log('[Hotels] list length =', list.length);

      const normalized: NormalizedHotel[] = list.map((h: RawHotel) => {
        const alias = h?.hotel_avgreview_and_count;

        const reviews: any[] =
          Array.isArray(h?._reviews) ? h._reviews :
          Array.isArray(h?.reviews) ? h.reviews : [];

        const nums: number[] = reviews
          .map((r: any) => Number(r?.rating_hotel))
          .filter((n: number): n is number => Number.isFinite(n));

        const computedAvg: number | null =
          nums.length ? nums.reduce((acc: number, val: number) => acc + val, 0) / nums.length : null;

        return {
          id: Number(h.id),
          name: h.name ?? h.Name ?? '',
          slug: h.slug,
          featured_image_url: h.featured_image_url ?? '/placeholder.jpg',
          alt_text: h.alt_text ?? null,
          price_level: h.price_level ?? null,

          avg_hotel_rating:
            h?.avg_hotel_rating ?? alias?.avg_hotel_rating ?? h?._hotel_avg_rating?.average_hotel_rating ?? computedAvg,
          hotel_review_count:
            h?.hotel_review_count ?? alias?.hotel_review_count ?? reviews.length,
          hotel_avgreview_and_count: alias ?? null,

          _hotel_avg_rating: h._hotel_avg_rating ?? null,
          _reviews: reviews,

          has_elevator: !!h.has_elevator,
          has_accessible_pathways: !!h.has_accessible_pathways,
          has_accessible_fitness_center: !!h.has_accessible_fitness_center,
          has_accessible_restaurant: !!h.has_accessible_restaurant,
          has_pool_lift: !!h.has_pool_lift,
          has_beach_wheelchair: !!h.has_beach_wheelchair,
          has_service_dog_policy: !!h.has_service_dog_policy,
          is_all_inclusive: !!h.is_all_inclusive,

          // pass through any category arrays present
          room_categories: Array.isArray(h?.room_categories) ? h.room_categories : undefined,
          _room_categories: Array.isArray(h?._room_categories) ? h._room_categories : undefined,
          room_categories_addon: Array.isArray(h?.room_categories_addon) ? h.room_categories_addon : undefined,
        };
      });

      console.log('[Hotels] normalized length =', normalized.length, 'sample:', normalized[0]);
      setHotels(normalized);
    } catch (e) {
      console.error('Failed to fetch hotels', e);
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  })();
}, [selectedDestinationId, destinations]);


  // derived filtering (client-side)
  const filteredHotels = useMemo(() => {
    return (hotels ?? []).filter((h) => {
      const matchesQuery = h.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProps = Object.entries(propFilters).every(
        ([k, want]) => !want || boolLike((h as any)[k])
      );

      const lvl = h.price_level == null ? null : Number(h.price_level);
      const matchesPrice = priceLevels.size === 0 || (lvl != null && priceLevels.has(lvl));

      const matchesRoom = hotelHasSelectedRoomFeatures(h, roomAmens);

      return matchesQuery && matchesProps && matchesPrice && matchesRoom;
    });
  }, [hotels, searchQuery, propFilters, priceLevels, roomAmens]);

  return (
    <>
      <Navbar />
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
                {(dest as any).Name ?? (dest as any).name}
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
                  const checked = (propFilters as any)[key];
                  const label = key
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
