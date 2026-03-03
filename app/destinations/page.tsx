'use client';

import styles from './page.module.css';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchDestinations } from '@/lib/api';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import type { Review } from '@/lib/types';
import { getDestAvg, getDestCount } from '@/lib/utils';
import RatingBadge from '../../components/ui/RatingBadge';

interface Destination {
  id: number;
  Name: string;
  slug: string;
  featured_image_url?: string;
  Region?: string;
  City?: string;
  Country?: string;
  state_or_provence?: string;
  alt_text?: string;

  avg_dest_rating?: number | string | null;
  review_count?: number | string | null;

  _avg_dest_rating?: { average_destination_rating?: number | string | null };
  _avg_destination_rating?: { destination_avg_rating?: number | string | null };
  _reviews?: Review[];
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDestinations();
        if (Array.isArray(data)) {
          setDestinations(data as Destination[]);
        } else {
          setDestinations([]);
        }
      } catch (err) {
        console.error('[ERROR] Failed to load destinations:', err);
        setError('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;

    const tokens = q.split(/\s+/);
    return destinations.filter((d) => {
      const haystack = [
        d.Name || '',
        d.Region || '',
        d.City || '',
        d.Country || '',
        d.state_or_provence || '',
      ]
        .join(' ')
        .toLowerCase();

      return tokens.every((t) => haystack.includes(t));
    });
  }, [destinations, query]);

  return (
    <>
      <Navbar />
      <main>
        <h1 className={styles.sectionTitle}>Browse Destinations</h1>

        <div className={styles.controls}>
          <input
            type="search"
            className={styles.searchBar}
            placeholder="Search by destination, region, country, state/province or city…"
            aria-label="Search destinations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading && <p className={styles.placeholder}>Loading destinations…</p>}
        {error && <p className={styles.placeholder}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className={styles.placeholder}>No destinations match your search.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className={styles['destinations-grid']}>
            {filtered.map((dest) => {
              const avg = getDestAvg(dest);
              const count = getDestCount(dest);

              // Two-line meta
              const line1 = [dest.Region, dest.Country].filter(Boolean).join(' • ');
              const line2 = [dest.City, dest.state_or_provence].filter(Boolean).join(', ');

              return (
                <article key={dest.id} className={styles['destination-card']}>
                  <img
                    src={dest.featured_image_url || '/placeholder.jpg'}
                    alt={dest.alt_text || `${dest.Name} cover image`}
                    className={styles['destination-image']}
                    loading="lazy"
                  />

                  {/* Title as green link */}
                  <h2 className={styles.cardTitle}>
                    <Link href={`/destinations/${dest.slug}`} className={styles.titleLink}>
                      {dest.Name}
                    </Link>
                  </h2>

                  <RatingBadge avg={avg} count={count} className={styles.ratingText} />
                  <div className={styles.divider} />

                  {/* Compact two-line meta */}
                  {line1 && <p className={styles.metaCompact}>{line1}</p>}
                  {line2 && <p className={styles.metaCompact}>{line2}</p>}

                  <Link
                    href={`/destinations/${dest.slug}`}
                    className={styles.viewbutton}
                  >
                    View Destination
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

