// app/submit-review/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import styles from './page.module.css';
import { init, PickerInstance } from 'filestack-js';
import { useRouter, useSearchParams } from 'next/navigation';
import ReviewTipsModal from '../../components/ui/ReviewTipsModal';
import { gaEvent } from '@/lib/ga';



// ---------------- helpers ----------------

function genIdemKey() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }
}

// ---------------- types ------------------

type Destination = { id: number; Name: string; slug: string };
type Hotel = { id: string; name: string; destinations_id?: number };
type RoomCategory = { id: string; name: string; hotels_id?: number };
type Photo = { url: string; alt?: string; handle: string };
type PhotoPayload = { url: string; alt?: string; order: number };

// ---------------- component --------------

export default function SubmitReviewPage() {
  const [formRenderAt] = useState<number>(() => Date.now());
  const [idempotencyKey] = useState<string>(() => genIdemKey());

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);

  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedRoomCategoryId, setSelectedRoomCategoryId] = useState('');
 
  const [showTips, setShowTips] = useState(false);
  const [hotelWriteIn, setHotelWriteIn] = useState('');
  const [hotelRating, setHotelRating] = useState('');
  const [roomCategoryRating, setRoomCategoryRating] = useState<string>('');

  const [showHotelRating, setShowHotelRating] = useState(true);
  const [photoGroupUrls, setPhotoGroupUrls] = useState<Photo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const pickerRef = useRef<PickerInstance | null>(null);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);


  // reCAPTCHA v2 (checkbox)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!;
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const widgetIdRef = useRef<number | null>(null);
  const recaptchaContainerId = 'recaptcha-checkbox-container';

  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationSlug = searchParams.get('destination') || '';
  const redirectPath = searchParams.get('redirect') || '/';

  // ---------- utils to normalize lists ----------
  function toArray(json: any): any[] {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.records)) return json.records;
    if (json && typeof json === 'object') {
      // filter to object-ish entries
      return Object.values(json).filter((v) => typeof v === 'object');
    }
    return [];
  }

  // ---------- reCAPTCHA load ----------
  useEffect(() => {
    const renderWidget = () => {
      if (!(window as any).grecaptcha) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = (window as any).grecaptcha.render(recaptchaContainerId, {
        sitekey: siteKey,
        callback: (token: string) => setRecaptchaToken(token),
        'expired-callback': () => setRecaptchaToken(''),
        'error-callback': () => setRecaptchaToken(''),
        theme: 'light',
        size: 'normal',
      });
    };

    if ((window as any).grecaptcha?.render) {
      renderWidget();
      return;
    }

    const onloadName = 'recaptchaOnload_' + Math.random().toString(36).slice(2);
    (window as any)[onloadName] = () => renderWidget();

    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?onload=${onloadName}&render=explicit`;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
    return () => {
      delete (window as any)[onloadName];
    };
  }, [siteKey]);

  // ---------- fetch Destinations (and pre-select by slug) ----------
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/destinations', {
          cache: 'no-store',
        });
        const json = await res.json();
        const list = toArray(json) as Destination[];
        setDestinations(list);

        if (destinationSlug) {
          const matched = list.find((d) => d.slug === destinationSlug);
          if (matched) {
            setSelectedDestinationId(String(matched.id));
            await fetchHotels(matched.id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch destinations:', e);
      }
    };
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- fetch Hotels by Destination ----------
  const normalizeHotel = (h: any): Hotel => ({
  id: String(h.id ?? h.hotel_id),
  name: h.name ?? h.hotel_name ?? h.title ?? 'Unnamed Hotel',
  destinations_id: h.destinations_id ?? h.destination_id ?? undefined,
});

const fetchHotels = async (destinationsId: number | string) => {
  const base = 'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/hotels';
  const tryUrls = [
    `${base}?destinations_id=${encodeURIComponent(String(destinationsId))}`, // plural
    `${base}?destination_id=${encodeURIComponent(String(destinationsId))}`,  // singular (fallback)
  ];

  try {
    // 1) try with param(s)
    for (const url of tryUrls) {
      const res = await fetch(url, { cache: 'no-store' });
      console.log('[fetchHotels] URL:', url, 'status:', res.status);
      if (!res.ok) continue;

      const json = await res.json();
      console.log('[fetchHotels] payload shape:', json && typeof json, json?.length);
      const raw = toArray(json);
      const list = raw
        .filter((h: any) => h && (h.id != null || h.hotel_id != null))
        .map(normalizeHotel);

      if (list.length > 0) {
        setHotels(list);
        return;
      }
    }

    // 2) last resort: fetch all, then client-filter
    const resAll = await fetch(base, { cache: 'no-store' });
    console.log('[fetchHotels] fallback ALL status:', resAll.status);
    if (!resAll.ok) throw new Error(`HTTP ${resAll.status}`);

    const jsonAll = await resAll.json();
    const rawAll = toArray(jsonAll);
    const listAll = rawAll
      .filter((h: any) => h && (h.id != null || h.hotel_id != null))
      .map(normalizeHotel)
      .filter((h) => String(h.destinations_id) === String(destinationsId));

    setHotels(listAll);
  } catch (e) {
    console.error('Failed to fetch hotels:', e);
    setHotels([]);
  }
};

  // ---------- fetch Room Categories by Hotel ----------
  const fetchRoomCategories = async (hotelId: number | string) => {
    try {
      // You can adjust this endpoint name to whatever you expose in Xano
      // e.g., /room_categories_by_hotel?hotel_id=...
      const res = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/room_categories_by_hotel?hotel_id=${encodeURIComponent(
          String(hotelId)
        )}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = toArray(json);
      const list: RoomCategory[] = raw
        .filter((rc: any) => rc && (rc.id != null || rc.room_category_id != null))
        .map((rc: any) => ({
          id: String(rc.id ?? rc.room_category_id),
          name: rc.name ?? rc.title ?? 'Unnamed Room Category',
          hotels_id: rc.hotels_id,
        }));
      setRoomCategories(list);
    } catch (e) {
      console.error('Failed to fetch room categories:', e);
      setRoomCategories([]);
    }
  };

  // ---------- on Hotel change ----------
  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;

  setSelectedHotelId(value);
  setSelectedRoomCategoryId('');
  setRoomCategoryRating('');
  setHotelWriteIn('');

  // These options mean "no listed hotel"
  const isNoHotelStay = value === 'didnt-stay';
  const isNotListed = value === 'not-listed';
  const isBlank = !value;

  if (isBlank || isNoHotelStay || isNotListed) {
    setShowHotelRating(false);
    setHotelRating('');
    setRoomCategories([]);
    return;
  }

  // Listed hotel selected
  setShowHotelRating(true);
  fetchRoomCategories(value);
};



  // ---------- Filestack ----------
  const handleFilestackUpload = () => {
  if (!pickerRef.current) {
    const client = init('Ac4UPEms0QsGVG6RBPstaz');

    pickerRef.current = client.picker({
      accept: ['image/*'],
      maxFiles: 5,

      onOpen: () => setIsUploadingPhotos(true),

      onUploadDone: async (result) => {
        setIsUploadingPhotos(true);
        try {
          const enrichedImages = await Promise.all(
            (result.filesUploaded || []).map(async (file: any) => {
              const handle = file.handle;
              const metadataUrl = `https://cdn.filestackcontent.com/metadata/${handle}`;

              try {
                const response = await fetch(metadataUrl);
                const metadata = await response.json();
                return { url: file.url, alt: metadata?.alt || "", handle };
              } catch {
                return { url: file.url, alt: "", handle };
              }
            })
          );

          // Append (keeps your current behavior)
          setPhotoGroupUrls((prev) => [...prev, ...enrichedImages].slice(0, 5));
        } finally {
          setIsUploadingPhotos(false);
        }
      },

      onClose: () => setIsUploadingPhotos(false),
    });
  }

  pickerRef.current.open();
};


const handleRemoveImage = async (urlToRemove: string) => {
  // Grab handle before removing from state
  const toDelete = photoGroupUrls.find((p) => p.url === urlToRemove);

  // Optimistic UI: remove immediately
  setPhotoGroupUrls((prev) => prev.filter((photo) => photo.url !== urlToRemove));

  // If we found a handle, attempt server-side deletion
  if (toDelete?.handle) {
    try {
      const res = await fetch("/api/filestack/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: toDelete.handle }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[filestack delete] status:", res.status, "data:", data);

      if (!res.ok || data?.ok === false) {
        console.warn("Filestack delete failed:", data);
      }
    } catch (e) {
      console.warn("Failed to delete Filestack file (network error):", e);
    }
  }
};

const canSubmit = useMemo(() => {
    return !!selectedDestinationId && !isUploadingPhotos && !submitting;
  }, [selectedDestinationId, isUploadingPhotos, submitting]);


  // ---------------- submit ----------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    // Honeypot
    const hp = (form.website?.value || '').toString().trim();
    if (hp.length > 0) {
      setStatusMsg('Thanks! Your review has been received.');
      form.reset();
      setSelectedDestinationId('');
      setSelectedHotelId('');
      setSelectedRoomCategoryId('');
      setHotelRating('');
      setRoomCategoryRating('');
      setShowHotelRating(true);
      setPhotoGroupUrls([]);
      return;
    }

    // Human timing (2.5s)
    const elapsed = Date.now() - formRenderAt;
    if (elapsed < 2500) {
      setStatusMsg('Thanks! Your review has been received.');
      form.reset();
      setSelectedDestinationId('');
      setSelectedHotelId('');
      setSelectedRoomCategoryId('');
      setHotelRating('');
      setRoomCategoryRating('');
      setShowHotelRating(true);
      setPhotoGroupUrls([]);
      return;
    }

    const name = form.reviewer_name.value.trim();
    const email = form.email.value.trim();
    const destinationId = selectedDestinationId;
    const hotelId = selectedHotelId;
    const ratingDestination = Number(form.rating_destination.value);
    const ratingHotel = hotelId === 'not-listed' ? null : Number(hotelRating) || null;

    // room category fields (only if a listed hotel was selected)
    const roomCategoryId =
      hotelId && hotelId !== 'not-listed' && selectedRoomCategoryId
        ? Number(selectedRoomCategoryId)
        : null;
    const ratingRoomCategory =
      hotelId && hotelId !== 'not-listed' && roomCategoryRating
        ? Number(roomCategoryRating)
        : null;

    const reviewText = form.review.value;
    const marketingOptIn = form.marketing_opt_in.checked;

    // Validation
    if (!name) return alert('Please enter your name.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) return alert('Please enter a valid email.');
    if (!destinationId) return alert('Please select a destination.');
    if (!ratingDestination) return alert('Please select a destination accessibility rating.');
    if (!hotelId) return alert('Please select a hotel option.');

    if (hotelId === 'not-listed' && !hotelWriteIn.trim()) {
      return alert('Please enter the hotel name.');
    }

    if (hotelId !== 'not-listed' && hotelId !== 'didnt-stay' && !ratingHotel)
      return alert('Please select a hotel accessibility rating.');
    if (!reviewText) return alert('Please share your experience.');

    // Ensure reCAPTCHA v2 is checked
    let token = recaptchaToken;
    if (!token && (window as any).grecaptcha && widgetIdRef.current !== null) {
      token = (window as any).grecaptcha.getResponse(widgetIdRef.current);
      setRecaptchaToken(token || '');
    }
    if (!token) {
      alert('Please verify that you are not a robot.');
      return;
    }

    if (isUploadingPhotos) {
      alert('Your photos are still uploading. Give it a few seconds and try again.');
      return;
    }

    gaEvent('review_submit_attempt', {
      destination_id: destinationId,
      hotel_id: hotelId,
      opted_in: marketingOptIn,
    });

    // Build photos payload
    const photosPayload: PhotoPayload[] = photoGroupUrls
      .slice(0, 5)
      .map((p, i) => {
        const url = (p.url || '').trim();
        const alt = (p.alt || '').trim();
        if (!url) return null as any;
        return alt ? { url, alt, order: i } : { url, order: i };
      })
      .filter(Boolean) as PhotoPayload[];

    try {
      setSubmitting(true);
      setStatusMsg(null);

      const payload = {
        destination_id: Number(destinationId),

        hotel_id:
          hotelId === 'not-listed' || hotelId === 'didnt-stay'
            ? null
            : Number(hotelId),

        didnt_stay_overnight: hotelId === 'didnt-stay',

        hotel_not_listed: hotelId === 'not-listed',

        hotel_write_in:
          hotelId === 'not-listed' ? hotelWriteIn.trim() : null,

        room_category_id: roomCategoryId,
        reviewer_name: name,
        rating_destination: ratingDestination,
        rating_hotel:
          hotelId === 'didnt-stay'
            ? null
            : hotelId === 'not-listed'
            ? Number(hotelRating) || null
            : ratingHotel,

        room_category_rating: ratingRoomCategory,
        review_text: reviewText,
        email,
        marketing_opt_in: !!marketingOptIn,
        submission_key: idempotencyKey,
        photos: photosPayload,
        recaptcha_token: token,
     };


      const response = await fetch(
        'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/review/create_with_photos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({} as any));
      if (!response.ok || data?.ok === false) {
        gaEvent('review_submit_failed', {
        destination_id: destinationId,
        hotel_id: hotelId,
        opted_in: marketingOptIn,
      });
        
        console.error('Xano error:', data);
        return alert(
          data?.message ? `Submission failed: ${data.message}` : 'Submission failed.'
        );
      }

      gaEvent('review_submit_success', {
        destination_id: destinationId,
        hotel_id: hotelId,
        opted_in: marketingOptIn,
        inserted_photos: data?.inserted ?? 0,
      });

      setStatusMsg(
        `Thanks! Your review was submitted. Inserted ${data?.inserted ?? 0} photos.`
      );

      // ✅ If they opted in, sync to Brevo (do NOT block the review if this fails)
      if (payload?.marketing_opt_in === true) {
        try {
          const brevoRes = await fetch(
            'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/sync_brevo_contact',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: payload?.email, // <-- change if your payload uses a different key
                first_name: payload?.reviewer_name, // Brevo maps this to FIRSTNAME via your Xano endpoint
                source: 'review',
              }),
            }
          );
        } catch (brevoError) {
          console.warn('Brevo sync failed:', brevoError);
        }
      }

      form.reset();
      setSelectedDestinationId('');
      setSelectedHotelId('');
      setSelectedRoomCategoryId('');
      setHotelRating('');
      setRoomCategoryRating('');
      setShowHotelRating(true);
      setRoomCategories([]);
      setPhotoGroupUrls([]);
      setRecaptchaToken('');

      if ((window as any).grecaptcha && widgetIdRef.current !== null) {
        (window as any).grecaptcha.reset(widgetIdRef.current);
      }

      router.replace(redirectPath);
    } catch (error) {
      console.error('Submission error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- render ---------------

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.pageWrapper}>
          <h1 className={styles.title}>Submit a Review</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              name="reviewer_name"
              className={`${styles.input} ${styles.formField}`}
              placeholder="Your Name"
              required
            />
            <input
              name="email"
              type="email"
              className={`${styles.input} ${styles.formField}`}
              placeholder="Your Email"
              required
            />

            <div className={`${styles.checkboxLabel} ${styles.formField}`}>
              <input type="checkbox" name="marketing_opt_in" />
              &nbsp;I’d like to receive occasional emails from Disability Traveler with accessible travel updates & tips. I can unsubscribe anytime.
            </div>

            {/* Destination */}
            <select
              className={`${styles.select} ${styles.formField}`}
              value={selectedDestinationId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDestinationId(id);
                setSelectedHotelId('');
                setSelectedRoomCategoryId('');
                setRoomCategories([]);
                setShowHotelRating(true);
                setHotelRating('');
                setRoomCategoryRating('');
                if (id) fetchHotels(Number(id));
              }}
              required
            >
              <option value="">Select Destination</option>
              {(Array.isArray(destinations) ? destinations : []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.Name}
                </option>
              ))}
            </select>

            {/* Hotel */}
            <select
              className={`${styles.select} ${styles.formField}`}
              value={selectedHotelId}
              onChange={handleHotelChange}
              disabled={!selectedDestinationId}
            >
              <option value="">Select Hotel</option>
              {(Array.isArray(hotels) ? hotels : []).map((h, idx) => (
                <option key={h.id || `h-${idx}`} value={h.id}>
                  {h.name}
                </option>
              ))}
              <option value="not-listed">My hotel is not listed</option>
              <option value="didnt-stay">No hotel stay (day trip/cruise stop/local)</option>
            </select>

            {selectedHotelId === 'not-listed' && (
              <input
                type="text"
                value={hotelWriteIn}
                onChange={(e) => setHotelWriteIn(e.target.value)}
                className={`${styles.input} ${styles.formField}`}
                placeholder="Please write in hotel name"
                required
             />
           )}


            {/* Room Category (only for listed hotel) */}
            {selectedHotelId &&
              selectedHotelId !== 'not-listed' &&
              selectedHotelId !== 'didnt-stay' && (
              <select
                className={`${styles.select} ${styles.formField}`}
                value={selectedRoomCategoryId}
                onChange={(e) => setSelectedRoomCategoryId(e.target.value)}
              >
                <option value="">Select Room Category (optional)</option>
                {(Array.isArray(roomCategories) ? roomCategories : []).map((rc, idx) => (
                  <option key={rc.id || `rc-${idx}`} value={rc.id}>
                    {rc.name}
                  </option>
                ))}
              </select>
            )}

            {/* Destination rating */}
            <select
              name="rating_destination"
              className={`${styles.select} ${styles.formField}`}
              required
            >
              <option value="">Destination Accessibility Rating</option>
              <option value="1">1 - Very Poor</option>
              <option value="2">2 - Poor</option>
              <option value="3">3 - Average</option>
              <option value="4">4 - Above Average</option>
              <option value="5">5 - Excellent</option>
            </select>

            {/* Hotel rating */}
            {showHotelRating && (
              <select
                className={`${styles.select} ${styles.formField}`}
                value={hotelRating}
                onChange={(e) => setHotelRating(e.target.value)}
                required
              >
                <option value="">Hotel Accessibility Rating</option>
                <option value="1">1 - Very Poor</option>
                <option value="2">2 - Poor</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Above Average</option>
                <option value="5">5 - Excellent</option>
              </select>
            )}

            {/* Room Category rating (only if a category is selected) */}
            {selectedHotelId &&
              selectedHotelId !== 'not-listed' &&
              selectedRoomCategoryId && (
                <select
                  className={`${styles.select} ${styles.formField}`}
                  value={roomCategoryRating}
                  onChange={(e) => setRoomCategoryRating(e.target.value)}
                >
                  <option value="">Room Category Accessibility Rating (optional)</option>
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setShowTips(true)}
                  className={styles.reviewTipsLink}
                >
                  Review tips
                </button>
             </div>
             <ReviewTipsModal
               isOpen={showTips}
               onClose={() => setShowTips(false)}
              />

            <textarea
              name="review"
              className={`${styles.textarea} ${styles.formField}`}
              placeholder="Share your accessibility experience..."
            />

            {/* Honeypot */}
            <label className="visuallyHidden" htmlFor="website">
              If you are a human, leave this field blank
            </label>
            <input
              id="website"
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              className="visuallyHidden"
              aria-hidden="true"
            />

            {/* reCAPTCHA v2 checkbox */}
            <div className={styles.captchaRow}>
              <div id={recaptchaContainerId} />
            </div>

            {/* Photo previews */}
            {photoGroupUrls.length > 0 && (
              <div className={styles.previewContainer}>
                {photoGroupUrls.map(({ url, alt }, index) => (
                  <div key={url} className={styles.previewImageWrapper}>
                    <img
                      src={url}
                      alt={alt || `Uploaded image ${index + 1}`}
                      className={styles.previewImage}
                   />
                   <button
                     type="button"
                     onClick={() => handleRemoveImage(url)}
                     className={styles.removeButton}
                   >
                     Remove
                   </button>
                   <input
                     type="text"
                     value={alt || ''}
                     placeholder="Alt text for accessibility"
                     onChange={(e) => {
                       const nextAlt = e.target.value;
                       setPhotoGroupUrls((prev) =>
                         prev.map((p) => (p.url === url ? { ...p, alt: nextAlt } : p))
                        );
                      }}
                     className={styles.altTextInput}
                   />
                 </div>
               ))}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleFilestackUpload}
                disabled={submitting}
                className={styles.uploadButton}
              >
                Upload Photos
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={styles.submitButton}
              >
                {submitting ? 'Submitting…' : isUploadingPhotos ? 'Uploading photos…' : 'Submit Review'}
              </button>

            </div>

            <div className={styles.certifyText}>
              By submitting this review, you confirm it reflects your direct experience as a traveler with a disability, or as a caregiver, guardian, or companion who was present. Reviews are published after approval. Typically within 24–48 hours. If it has been longer than 48 hours and your review is not visible, please email help@disabilitytraveler.com.
           </div>


            {statusMsg && <p style={{ marginTop: 12, fontSize: 14 }}>{statusMsg}</p>}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}





