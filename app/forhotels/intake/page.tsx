// Rewritten intake.page.tsx with alt text previews for both general and room photos
'use client';

import React, { useState } from 'react';
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
];

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
];

export default function HotelIntakeForm() {
  const [roomBlocks, setRoomBlocks] = useState([{ id: 1 }]);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [propertyPhotos, setPropertyPhotos] = useState<FileInfo[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<{ [roomId: number]: any[] }>({});

  const addRoomBlock = () => setRoomBlocks([...roomBlocks, { id: Date.now() }]);
  const removeRoomBlock = (id: number) => setRoomBlocks((prev) => prev.filter((block) => block.id !== id));

  const handleAltChange = (index: number, alt: string) => {
    const updated = [...propertyPhotos];
    updated[index].alt = alt;
    setPropertyPhotos(updated);
  };

  const handleRoomAltChange = (
    roomId: number,
    index: number,
    alt: string,
    setRoomPhotos: React.Dispatch<React.SetStateAction<{ [roomId: number]: any[] }>>
  ) => {
    setRoomPhotos((prev) => {
      const updated = { ...prev };
      const files = [...(updated[roomId] || [])];
      if (files[index]) {
        files[index].alt = alt;
      }
      updated[roomId] = files;
      return updated;
    });
  };

  const handleRemovePropertyPhoto = (url: string) => {
  setPropertyPhotos((prev) => prev.filter((file) => file.url !== url));
 };


  const handleRemoveRoomImage = (roomId: number, url: string) => {
  setRoomPhotos((prev) => {
    const updated = { ...prev };
    updated[roomId] = (updated[roomId] || []).filter((file) => file.url !== url);
    return updated;
  });
 };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormStatus('submitting');
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  try {
    const payload: any = {
      hotel_name: formData.get('hotel_name'),
      brand_name: formData.get('brand'),
      website: formData.get('website'),
      street_address: formData.get('address'),
      contact_name: formData.get('contact_name'),
      contact_email: formData.get('contact_email'),
      contact_phone: formData.get('contact_phone'),
      hotel_phone: formData.get('phone_number'),
      hotel_description: formData.get('description'),
      additional_notes: formData.get('notes'),
      submitter_agreement: formData.get('permission_granted') === 'on',
      property_amenities: {},
      property_photos: propertyPhotos.map((photo) => ({
        url: photo.url,
        alt_text: photo.alt || '',
        width: photo.width,
        height: photo.height,
      })),
      room_categories: [],
    };

    PROPERTY_AMENITIES.forEach(({ key }) => {
      payload.property_amenities[key] = formData.get(`property_${key}`) === 'on';
    });

    roomBlocks.forEach(({ id }) => {
      const features: { [key: string]: boolean } = {};
      ROOM_AMENITIES.forEach(({ key }) => {
        features[key] = formData.get(`room_${id}_feature_${key}`) === 'on';
      });

      payload.room_categories.push({
        name: formData.get(`room_name_${id}`),
        ...features,
        room_category_photos: (roomPhotos[id] || []).map((file) => ({
          url: file.url,
          alt_text: file.alt || '',
          width: file.width,
          height: file.height,
        })),
      });
    });

    console.log('Payload being submitted:', payload);

    const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/submit-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Submission failed');
    setFormStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset form fields
    form.reset();

    // Clear component state
    setPropertyPhotos([]);
    setRoomPhotos({});
    setRoomBlocks([{ id: Date.now() }]);

  } catch (err) {
    setFormStatus('error');
  }
};

  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <h1 className={styles.title}>Submit Your Hotel for Listing</h1>
        <p className={styles.intro}>Please complete the form below. Listings are free. We'll follow up by email once reviewed.</p>

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
            <textarea name="description" placeholder="Please provide a 100–200 word description of your property" rows={4} className={styles.notesBox} />
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
                  onUploadDone={(files) => setPropertyPhotos(files.filesUploaded)}
               />
             </div>

             {propertyPhotos.map((file, index) => (
               <div
                 key={index}
                 style={{
                   display: 'inline-flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   marginRight: '8px',
                   marginBottom: '1.5rem',
                 }}
               >
               <div
                 style={{
                   position: 'relative',
                   display: 'inline-block',
                   maxWidth: '200px',
                  }}
               >
               <img
                 src={file.url}
                 alt={file.alt || 'Uploaded photo'}
                 style={{
                   width: '100%',
                   display: 'block',
                   borderRadius: '4px',
                 }}
               />
               <button
                 type="button"
                 onClick={() => handleRemovePropertyPhoto(file.url)}
                 style={{
                   position: 'absolute',
                   top: '6px',
                   right: '6px',
                   backgroundColor: '#d00',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
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
               onChange={(e) => {
                 const updated = [...propertyPhotos];
                 updated[index].alt = e.target.value;
                 setPropertyPhotos(updated);
               }}
               style={{
                 width: '200px',
                 padding: '4px',
                 border: '1px solid #ccc',
                 borderRadius: '4px',
                 marginTop: '6px',
                 fontSize: '0.875rem',
               }}
             />
           </div>
         ))}
             <p className={styles.uploadNote}>
                If you have photos of your property's accessible features, please include them — they are encouraged but not required.
                You're also welcome to upload any professional photos that best represent your property overall.
             </p>
           </div>
         </fieldset>


          <fieldset>
            <legend>Accessible Room Categories</legend>
            {roomBlocks.map((block, index) => (
              <div key={block.id} className={styles.roomBlock}>
                <h4>Room Category #{index + 1}</h4>
                <input name={`room_name_${block.id}`} placeholder="Room Category Name" required className={styles.roomNameInput} />
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
                      label="Upload room_photos"
                      maxFiles={4}
                      onUploadDone={(files) =>
                      setRoomPhotos((prev) => ({ ...prev, [block.id]: files.filesUploaded }))
                   }
                 />
               </div>

               {(roomPhotos[block.id] || []).map((file, index) => (
                 <div
                   key={file.handle || index}
                   style={{
                     display: 'inline-flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     marginRight: '8px',
                     marginBottom: '1.5rem',
                   }}
                  >
                   <div
                     style={{
                       position: 'relative',
                       display: 'inline-block',
                       maxWidth: '200px',
                     }}
                   >
                     <img
                       src={file.url}
                       alt={file.alt || 'Room photo'}
                       style={{
                         width: '100%',
                         display: 'block',
                         borderRadius: '4px',
                       }}
                     />
                       <button
                         type="button"
                         onClick={() => handleRemoveRoomImage(block.id, file.url)}
                         style={{
                           position: 'absolute',
                           top: '6px',
                           right: '6px',
                           backgroundColor: '#d00',
                           color: 'white',
                           border: 'none',
                           borderRadius: '4px',
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
                       onChange={(e) => {
                         setRoomPhotos((prev) => {
                           const updated = { ...prev };
                           const files = [...(updated[block.id] || [])];
                           if (files[index]) files[index].alt = e.target.value;
                           updated[block.id] = files;
                           return updated;
                         });
                       }}
                       style={{
                         width: '200px',
                         padding: '4px',
                         border: '1px solid #ccc',
                         borderRadius: '4px',
                         marginTop: '6px',
                         fontSize: '0.875rem',
                       }}
                     />
                   </div>
                 ))}


                <p className={styles.uploadNote}>
                  Please provide 1–4 photos of the room category. If you have professional photos of the accessible version of this room category, that is preferred.
                  However, if not available, feel free to upload photos of the standard version as an example.
               </p>
             </div>

                <button type="button" onClick={() => removeRoomBlock(block.id)}>
                  Delete This Room Category
                </button>
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

          {formStatus === 'success' && <p className={styles.success}>Thanks! We'll be in touch via email soon.</p>}
          {formStatus === 'error' && <p className={styles.error}>Something went wrong. Please try again.</p>}
        </form>
      </main>
      <Footer />
    </>
  );
}

