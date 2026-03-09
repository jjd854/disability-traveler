import axios from 'axios';
import { Destination, Hotel } from './types'; // ✅ import the types

export const API_BASE_URL =  'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz';

export const fetchDestinations = async (): Promise<Destination[]> => {
  const response = await axios.get(`${API_BASE_URL}/destinations`);
  return response.data;
};

export const fetchDestinationById = async (slug: string): Promise<Destination | null> => {
  try {
    console.log("Slug passed to fetchDestinationById:", slug);

    const response = await axios.get(`${API_BASE_URL}/destination_by_slug`, {
      params: { slug },

    });
    return response.data; // ✅ now TypeScript knows this is a single Destination
  } catch (err: unknown) {
    // If Xano returns 404 (not found or not published), treat as "no destination"
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err; // other errors should still bubble up
  }
};

export async function fetchHotelBySlug(slug: string) {
  const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz/hotel_by_slug?slug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch hotel");
  const data = await res.json();
  return data;
}

export const fetchHotelsByDestinationId = async (destinationId: string): Promise<Hotel[]> => {
  const response = await axios.get(`${API_BASE_URL}/hotels_by_destination_id`, {
    params: { destination_id: destinationId },
  })
  return response.data
}

export async function submitHotelForm(formData: FormData) {
  console.log('Stub: received hotel form data', formData);
  return { ok: true };
}




