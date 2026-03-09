import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------- Ratings helpers (lint-safe, no `any`) ----------

type UnknownRecord = Record<string, unknown>;

const asRecord = (v: unknown): UnknownRecord | null =>
  v !== null && typeof v === "object" ? (v as UnknownRecord) : null;

const get = (obj: unknown, key: string): unknown => asRecord(obj)?.[key];

const numOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const numOrZero = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// lib/utils.ts
export function getDestAvg(d: unknown): number | null {
  const v =
    get(d, "avg_dest_rating") ??
    get(get(d, "_avg_dest_rating"), "average_destination_rating") ??
    get(get(d, "_avg_destination_rating"), "destination_avg_rating") ??
    null;

  return numOrNull(v);
}

export function getDestCount(d: unknown): number {
  const direct = get(d, "review_count");
  if (direct !== undefined && direct !== null) return numOrZero(direct);

  const reviews = get(d, "_reviews");
  return Array.isArray(reviews) ? reviews.length : 0;
}

export function getHotelAvg(h: unknown): number | null {
  const v =
    get(h, "avg_hotel_rating") ??
    get(get(h, "_hotel_avg_rating"), "average_hotel_rating") ??
    null;

  return numOrNull(v);
}

export function getHotelCount(h: unknown): number {
  const direct = get(h, "hotel_review_count");
  if (direct !== undefined && direct !== null) return numOrZero(direct);

  const reviews = get(h, "_reviews");
  return Array.isArray(reviews) ? reviews.length : 0;
}



