'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './IntakeForm.module.css';
import FilestackUpload from '@/components/ui/FilestackUpload';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import type { FileInfo } from '@/lib/types';

const PROPERTY_AMENITIES = [
  { key: 'elevator', label: 'Elevator' },
  { key: 'accessible_pathways', label: 'Accessible Pathways' },
  { key: 'accessible_fitness_center', label: 'Accessible Fitness Center' },
  { key: 'accessible_restaurant', label: 'Accessible Restaurant' },
  { key: 'pool_lift', label: 'Pool Lift' },
  { key: 'beach_wheelchair', label: 'Beach Wheelchair' },
  { key: 'service_dogs_welcome', label: 'Service Dogs Welcome' },
  { key: 'all_inclusive', label: 'All-Inclusive' },
] as const;

const ROOM_AMENITIES = [
  { key: 'door_32_in', label: '32" Door' },
  { key: 'lowered_bed', label: 'Lowered Bed' },
  { key: 'roll_under_vanity', label: 'Roll Under Vanity' },
  { key: 'roll_in_shower', label: 'Roll-in Shower' },
  { key: 'shower_seat_fixed', label: 'Shower Seat' },
  { key: 'tub_with_bench', label: 'Tub with Bench' },
  { key: 'handheld_shower', label: 'Handheld Shower' },
  { key: 'bathroom_grab_bars', label: 'Bathroom Grab Bars' },
  { key: 'turning_radius_60_in', label: 'Turning Radius ≥ 60"' },
  { key: 'visual_alarm', label: 'Visual Alarm' },
  { key: 'hearing_kit_available', label: 'Hearing Kit Available' },
] as const;

type PropertyAmenityKey = (typeof PROPERTY_AMENITIES)[number]['key'];
type RoomAmenityKey = (typeof ROOM_AMENITIES)[number]['key'];

type UploadPhoto = FileInfo & {
  alt?: string;
  // some uploads may include a "handle" — keep it optional for stable React keys
  handle?: string;
};

type PhotoPayload = {
  url: string;
  alt_text: string;
  width?: number;
  height?: number;
};

type RoomCategoryPayload = {
  name: string;
  room_category_photos: PhotoPayload[];
} & Record<RoomAmenityKey, boolean>;

type IntakePayload = {
  hotel_name: string | null;
  brand_name: string | null;
  website: string | null;
  street_address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  hotel_phone: string | null;
  hotel_description: string | null;
  additional_notes: string | null;
  submitter_agreement: boolean;
  property_amenities: Record<PropertyAmenityKey, boolean>;
  property_photos: PhotoPayload[];
  room_categories: RoomCategoryPayload[];
};

type RoomBlock = { id: number };

const toText = (v: FormDataEntryValue | null): string | null => {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : null;
  }
  return null;
};

const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

export default function HotelIntakeForm() {
  const [roomBlocks, setRoomBlocks] = useState<RoomBlock[]>([{ id: 1 }]);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [propertyPhotos, setPropertyPhotos] = useState<UploadPhoto[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<Record<number, UploadPhoto[]>>({});

  const introText = useMemo(
    () => "Please complete the form below. Listings are free. We'll follow up by email once reviewed.",
    []
  );

  const addRoomBlock = useCallback(() => {
    setRoomBlocks((prev) => [...prev, { id: makeId() }]);
  }, []);

  const removeRoomBlock = useCallback((id: number) => {
    setRoomBlocks((prev) => prev.filter((b) => b.id !== id));
    setRoomPhotos((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleRemovePropertyPhoto = useCallback((url: string) => {
    setPropertyPhotos((prev) => prev.filter((file) => file.url !== url));
  }, []);

  const handleRemoveRoomImage = useCallback((roomId: number, url: string) => {
    setRoomPhotos((prev) => {
      const next = { ...prev };
      next[roomId] = (next[roomId] || []).filter((file) => file.url !== url);
      return next;
    });
  }, []);

  const updatePropertyAlt = useCallback((index: number, alt: string) => {
    setPropertyPhotos((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      next[index] = { ...item, alt };
      return next;
    });
  }, []);

  const updateRoomAlt = useCallback((roomId: number, index: number, alt: string) => {
    setRoomPhotos((prev) => {
      const next = { ...prev };
      const files = [...(next[roomId] || [])];
      const f = files[index];
      if (!f) return prev;
      files[index] = { ...f, alt };
      next[roomId] = files;
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const propertyAmenityState = {} as Record<PropertyAmenityKey, boolean>;
      PROPERTY_AMENITIES.forEach(({ key }) => {
        propertyAmenityState[key] = formData.get(`property_${key}`) === 'on';
      });

      const payload: IntakePayload = {
        hotel_name: toText(formData.get('hotel_name')),
        brand_name: toText(formData.get('brand')),
        website: toText(formData.get('website')),
        street_address: toText(formData.get('address')),
        contact_name: toText(formData.get('contact_name')),
        contact_email: toText(formData.get('contact_email')),
        contact_phone: toText(formData.get('contact_phone')),
        hotel_phone: toText(formData.get('phone_number')),
        hotel_description: toText(formData.get('description')),
        additional_notes: toText(formData.get('notes')),
        submitter_agreement: formData.get('permission_granted') === 'on',
        property_amenities: propertyAmenityState,
        property_photos: propertyPhotos.map((p) => ({
          url: p.url,
          alt_text: p.alt || '',
          width: p.width,
          height: p.height,
        })),
        room_categories: [],
      };

      roomBlocks.forEach(({ id }) => {
        const features = {} as Record<RoomAmenityKey, boolean>;
        ROOM_AMENITIES.forEach(({ key }) => {
          features[key] = formData.get(`room_${id}_feature_${key}`) === 'on';
        });

        const roomPayload: RoomCategoryPayload = {
          name: String(formData.get(`room_name_${id}`) ?? ''),
          room_category_photos: (roomPhotos[id] || []).map((f) => ({
            url: f.url,
            alt_text: f.alt || '',
            width: f.width,
            height: f.height,
          })),
          ...features,
        };

        payload.room_categories.push(roomPayload);
      });

      const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Submission failed (${res.status})`);
      }

      setFormStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset everything
      form.reset();
      setPropertyPhotos([]);
      setRoomPhotos({});
      setRoomBlocks([{ id: makeId() }]);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      setFormStatus('error');
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <h1 className={styles.title}>Submit Your Hotel for Listing</h1>
        <p className={styles.intro}>{introText}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <fieldset>
            <legend>Hotel Info</legend>
            <input name="hotel_name" placeholder="Hotel Name" required />
            <input name="brand" placeholder="Brand (or Independent)" />
            <input name="website" placeholder="Website" type="url" />
            <input name="address" placeholder="Street Address" />
            <input name="contact_name" placeholder="Contact Name" required />
            <input name="contact_email" placeholder="Contact Email" type="email" required />
            <input name="contact_phone" placeholder="Contact Phone Number" />
            <input name="phone_number" placeholder="Hotel Phone (if different)" />
          </fieldset>

          <fieldset>
            <legend>Hotel Description</legend>
            <textarea
              name="description"
              placeholder="Please provide a 100–200 word description of your property"
              rows={4}
              className={styles.notesBox}
            />
          </fieldset>

          <fieldset>
            <legend>Property Accessibility Features</legend>
            {PROPERTY_AMENITIES.map(({ key, label }) => (
              <label key={key} className={styles.checkbox}>
                <input type="checkbox" name={`property_${key}`} /> {label}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>General Property Photos (1–10)</legend>
            <div className={styles.uploadGroup}>
              <div style={{ isolation: 'isolate', position: 'relative', zIndex: 1 }}>
                <FilestackUpload
                  name="general_photos"
                  label="Upload property photos"
                  maxFiles={10}
                  onUploadDone={(files) => setPropertyPhotos(files.filesUploaded as UploadPhoto[])}
                />
              </div>

              {propertyPhotos.map((file, index) => (
                <div
                  key={file.handle || file.url || index}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginRight: '8px',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-block', width: 200 }}>
                    <Image
                      src={file.url}
                      alt={file.alt || 'Uploaded property photo'}
                      width={200}
                      height={140}
                      style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePropertyPhoto(file.url)}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: '#d00',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Alt text for accessibility"
                    value={file.alt || ''}
                    onChange={(e) => updatePropertyAlt(index, e.target.value)}
                    style={{
                      width: 200,
                      padding: 4,
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      marginTop: 6,
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              ))}

              <p className={styles.uploadNote}>
                If you have photos of your property&apos;s accessible features, please include them — they are encouraged but not required.
                You&apos;re also welcome to upload any professional photos that best represent your property overall.
              </p>
            </div>
          </fieldset>

          <fieldset>
            <legend>Accessible Room Categories</legend>

            {roomBlocks.map((block, index) => (
              <div key={block.id} className={styles.roomBlock}>
                <h4>Room Category #{index + 1}</h4>

                <input
                  name={`room_name_${block.id}`}
                  placeholder="Room Category Name"
                  required
                  className={styles.roomNameInput}
                />

                <div className={styles.roomFeatures}>
                  {ROOM_AMENITIES.map(({ key, label }) => (
                    <label key={key}>
                      <input type="checkbox" name={`room_${block.id}_feature_${key}`} value="on" /> {label}
                    </label>
                  ))}
                </div>

                <div className={styles.uploadGroup}>
                  <div style={{ isolation: 'isolate', position: 'relative', zIndex: 1 }}>
                    <FilestackUpload
                      name={`room_photos_${block.id}`}
                      label="Upload room photos"
                      maxFiles={4}
                      onUploadDone={(files) =>
                        setRoomPhotos((prev) => ({
                          ...prev,
                          [block.id]: files.filesUploaded as UploadPhoto[],
                        }))
                      }
                    />
                  </div>

                  {(roomPhotos[block.id] || []).map((file, i) => (
                    <div
                      key={file.handle || file.url || i}
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginRight: '8px',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div style={{ position: 'relative', display: 'inline-block', width: 200 }}>
                        <Image
                          src={file.url}
                          alt={file.alt || 'Room photo'}
                          width={200}
                          height={140}
                          style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomImage(block.id, file.url)}
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            backgroundColor: '#d00',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Alt text for accessibility"
                        value={file.alt || ''}
                        onChange={(e) => updateRoomAlt(block.id, i, e.target.value)}
                        style={{
                          width: 200,
                          padding: 4,
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          marginTop: 6,
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  ))}

                  <p className={styles.uploadNote}>
                    Please provide 1–4 photos of the room category. If you have professional photos of the accessible version of this room
                    category, that is preferred. If not available, feel free to upload photos of the standard version as an example.
                  </p>
                </div>

                {roomBlocks.length > 1 && (
                  <button type="button" onClick={() => removeRoomBlock(block.id)}>
                    Delete This Room Category
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addRoomBlock} className={styles.addBtn}>
              + Add Another Room Category
            </button>
          </fieldset>

          <fieldset className={styles.finalSection}>
            <textarea name="notes" placeholder="Additional Notes or Comments" rows={4} />
            <label className={styles.checkbox}>
              <input type="checkbox" name="permission_granted" required />
              I have the rights to submitted photos and grant Disability Traveler permission to publish.
            </label>
          </fieldset>

          <button type="submit" disabled={formStatus === 'submitting'}>
            {formStatus === 'submitting' ? 'Submitting…' : 'Submit Listing'}
          </button>

          {formStatus === 'success' && <p className={styles.success}>Thanks! We&apos;ll be in touch via email soon.</p>}
          {formStatus === 'error' && <p className={styles.error}>Something went wrong. Please try again.</p>}
        </form>
      </main>
      <Footer />
    </>
  );
}
