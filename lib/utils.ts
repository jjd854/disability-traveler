import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts
export function getDestAvg(d: any): number | null {
  const v = d?.avg_dest_rating ?? d?._avg_dest_rating?.average_destination_rating ?? d?._avg_destination_rating?.destination_avg_rating ?? null;
  return v == null ? null : Number(v);
}
export function getDestCount(d: any): number {
  return Number(d?.review_count ?? (Array.isArray(d?._reviews) ? d._reviews.length : 0));
}
export function getHotelAvg(h: any): number | null {
  const v = h?.avg_hotel_rating ?? h?._hotel_avg_rating?.average_hotel_rating ?? null;
  return v == null ? null : Number(v);
}
export function getHotelCount(h: any): number {
  return Number(h?.hotel_review_count ?? (Array.isArray(h?._reviews) ? h._reviews.length : 0));
}



