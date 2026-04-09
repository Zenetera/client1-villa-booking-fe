import { api } from './client';
import type { Villa } from '../types/villa';

interface VillaApiResponse {
  data: {
    id: number;
    nameEn: string;
    descriptionEn: string;
    shortDescriptionEn: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    basePricePerNight: string;
    currency: string;
    amenitiesEn: string[];
    address: string;
    [key: string]: unknown;
  };
}

export interface PricingNight {
  date: string;
  price: string;
  ruleName: string | null;
}

export interface PricingQuote {
  numNights: number;
  nights: PricingNight[];
  accommodationTotal: string;
  nightlyRate: string;
  touristTaxPerNight: string;
  touristTaxTotal: string;
  totalPrice: string;
}

interface PricingQuoteResponse {
  data: PricingQuote;
}

export async function fetchVilla(): Promise<Villa> {
  const res = await api<VillaApiResponse>('/api/villa');
  const v = res.data;

  return {
    id: String(v.id),
    name: v.nameEn,
    location: v.address,
    tagline: v.shortDescriptionEn,
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    maxGuests: v.maxGuests,
    pricePerNight: parseFloat(v.basePricePerNight),
    currency: '€',
    description: v.descriptionEn.split('\n\n').filter(Boolean),
    amenities: Array.isArray(v.amenitiesEn) ? v.amenitiesEn : [],
  };
}

export async function fetchPricingQuote(
  checkIn: string,
  checkOut: string,
): Promise<PricingQuote> {
  const res = await api<PricingQuoteResponse>(
    `/api/pricing?from=${checkIn}&to=${checkOut}`,
  );
  return res.data;
}
