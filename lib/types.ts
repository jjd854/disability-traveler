// =========================
// Core Entities
// =========================

export type Hotel = {
  id: number;
  name: string;
  slug: string;
  featured_image_url: string;
  is_placeholder_image?: boolean;
  accessibility_summary?: string;
  destinations_id: number;
  price_level?: number | string | null;
  dt_verified_room_notes?: string | null;
  dt_verified_property_notes?: string | null;

  has_pool_lift?: boolean;
  has_beach_wheelchair?: boolean;
  has_elevator?: boolean;
  is_all_inclusive?: boolean;
  has_accessible_pathways?: boolean;
  has_accessible_restaurant?: boolean;
  has_accessible_fitness_center?: boolean;
  has_service_dog_policy?: boolean;
  has_accessible_meeting_spaces?: boolean;
  accessibility_confidence?: string | null;

  alt_text?: string;

  hotel_avg_rating?: {
    average_hotel_rating: number | null;
  };

  _reviews?: Review[];
};

export type Destination = {
  id: number;
  Name: string;                // matches Xano payload
  slug: string;
  Region: string;
  Country: string;
  City?: string;
  state_or_provence?: string;
  Description?: string;
  featured_image_url?: string;
  accessibility_rating?: string;
  is_featured?: boolean;
  tags?: string[];
  hotels?: Hotel[];
  _reviews?: Review[];
  accessibility_overview?: string | null;
  local_accessibility_services?: string | null;
  transportation?: string;
  activities?: string;
  traveler_tips?: string;
  alt_text?: string;

  _avg_destination_rating?: {
    destination_avg_rating: number;
  };
};

// =========================
// Linked mini-shapes (used on Review)
// =========================

export type ReviewDestination = {
  Name: string;
  slug?: string;               // present in your payload
};

export type ReviewHotelMini = {
  name: string;
  slug?: string;               // present in your payload
};

export type ReviewRoomCategoryMini = {
  id: number;
  name: string;
  slug?: string;               // present in your payload
};

export type ReviewPhoto = {
  id?: number | null;
  url: string;
  alt_text?: string | null;
  sort_order?: number | null;
  reviews_id?: number | null;
};

// =========================
// Review
// =========================

export type Review = {
  id: number;
  reviewer_name: string;
  created_at: number;                     // epoch ms in your response
  review_text: string;
  hotel_free_text?: string | null;
  didnt_stay_overnight?: boolean | null;
  hotel_write_in?: string | null;


  rating_destination: number | null;
  rating_hotel: number | null;
  room_category_rating?: number | string | null;

  hotels_id?: number;
  destinations_id?: number;
  room_categories_id?: number | null;

  // Linked objects returned by Xano (already in your payload)
  destinations?: ReviewDestination | null;
  review_hotels?: ReviewHotelMini | null;
  review_room_category?: ReviewRoomCategoryMini | null;

  // Optional flattened fallbacks if you ever add them in Xano
  destination_slug?: string;
  hotel_slug?: string;

  // Optional alternative shapes you mentioned using in places
  room_category?: { name?: string } | null;
  room_category_name?: string | null;

  // Photos attached to the review
  review_photos?: ReviewPhoto[];
};

export type ReviewCardProps = {
  review: Review;
};

// =========================
// Room Category Types
// =========================

export type RoomCategoryPhoto = {
  url: string;
  is_placeholder_image?: boolean;
  alt_text: string;
  width?: number;
  height?: number;
  sort_order?: number;
};

export type RoomCategory = {
  id: number;
  name: string;
  slug: string;
  is_accessible?: boolean;
  accessibility_confidence?: string | null;

  // If you map the add-on like in your payload:
  avg_room_category_rating?: number | null;
  room_category_rating_count?: number | null;

  features_json: {
    door_32_in?: boolean;
    lowered_bed?: boolean;
    roll_under_vanity?: boolean;
    roll_in_shower?: boolean;
    shower_seat_fixed?: boolean;
    tub_with_bench?: boolean;
    handheld_shower?: boolean;
    bathroom_grab_bars?: boolean;
    turning_radius_60_in?: boolean;
    visual_alarm?: boolean;
    hearing_kit_available?: boolean;
    accessible_balcony?: boolean;
    rollout_patio?: boolean;
    bed_clearance_underframe?: number | null;
  };

  photos_example?: RoomCategoryPhoto[];
};


export interface FileInfo {
  url: string;
  alt: string;
  width: number;
  height: number;
}

