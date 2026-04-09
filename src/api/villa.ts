import { api } from './client';
import type { Villa } from '../types/villa';
import type { Lang } from '../i18n/translations';

interface VillaApiResponse {
  data: {
    id: number;
    nameEn: string;
    nameEl: string | null;
    descriptionEn: string;
    descriptionEl: string | null;
    shortDescriptionEn: string;
    shortDescriptionEl: string | null;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    basePricePerNight: string;
    currency: string;
    amenitiesEn: string[];
    amenitiesEl: string[] | null;
    houseRulesEn: string | null;
    houseRulesEl: string | null;
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

export async function fetchVilla(lang: Lang = 'en'): Promise<Villa> {
  const res = await api<VillaApiResponse>('/api/villa');
  const v = res.data;

  const isEl = lang === 'el';

  return {
    id: String(v.id),
    name: (isEl && v.nameEl) || v.nameEn,
    location: v.address,
    tagline: (isEl && v.shortDescriptionEl) || v.shortDescriptionEn,
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    maxGuests: v.maxGuests,
    pricePerNight: parseFloat(v.basePricePerNight),
    currency: '€',
    description: ((isEl && v.descriptionEl) || v.descriptionEn)
      .split('\n\n')
      .filter(Boolean),
    amenities: (isEl && v.amenitiesEl) || (Array.isArray(v.amenitiesEn) ? v.amenitiesEn : []),
    houseRules: (isEl && v.houseRulesEl) || v.houseRulesEn,
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
