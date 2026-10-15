import type { Destination, Hotel } from './types';

export const API_BASE_URL =
  'https://x8ki-letl-twmt.n7.xano.io/api:3jVxSIOz';

// Cache successful API responses for 15 minutes.
const CACHE_DURATION = 900;

// Shared helper for retrieving data from Xano.
async function fetchFromXano<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T | null> {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);

  // Add query parameters when provided.
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    next: {
      revalidate: CACHE_DURATION,
    },
  });

  // A 404 means the requested resource doesn't exist.
  if (response.status === 404) {
    return null;
  }

  // Handle rate limiting and other API errors.
  if (!response.ok) {
    console.error(
      `Xano API error: ${response.status} ${response.statusText}`,
      {
        endpoint,
        params,
      }
    );

    throw new Error(
      `Xano API request failed: ${endpoint} (${response.status})`
    );
  }

  return (await response.json()) as T;
}

// --------------------------------------------------
// DESTINATIONS
// --------------------------------------------------

// Retrieve all destinations.
export const fetchDestinations = async (): Promise<Destination[]> => {
  const data = await fetchFromXano<Destination[]>('destinations');

  return data ?? [];
};

// Retrieve a destination by its slug.
export const fetchDestinationById = async (
  slug: string
): Promise<Destination | null> => {
  return fetchFromXano<Destination>('destination_by_slug', {
    slug,
  });
};

// --------------------------------------------------
// HOTELS
// --------------------------------------------------
type HotelBySlugResponse = {
  result1: Hotel | null;
  hotel_photos1: unknown[];
  accessibility_videos: unknown[];
};

// Retrieve a hotel by its slug.
export async function fetchHotelBySlug(
  slug: string
): Promise<HotelBySlugResponse> {
  const response = await fetchFromXano<HotelBySlugResponse>(
    'hotel_by_slug',
    { slug }
  );

  return response ?? {
    result1: null,
    hotel_photos1: [],
    accessibility_videos: [],
  };
}

// Retrieve hotels associated with a destination.
export const fetchHotelsByDestinationId = async (
  destinationId: string
): Promise<Hotel[]> => {
  const data = await fetchFromXano<Hotel[]>(
    'hotels_by_destination_id',
    {
      destination_id: destinationId,
    }
  );

  return data ?? [];
};

// --------------------------------------------------
// HOTEL SUBMISSION
// --------------------------------------------------

// Existing placeholder function. Left unchanged.
export async function submitHotelForm(formData: FormData) {
  console.log('Stub: received hotel form data', formData);

  return { ok: true };
}




