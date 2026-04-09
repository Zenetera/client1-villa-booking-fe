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
    latitude: v.latitude != null ? parseFloat(String(v.latitude)) : null,
    longitude: v.longitude != null ? parseFloat(String(v.longitude)) : null,
    tagline: (isEl && v.shortDescriptionEl) || v.shortDescriptionEn,
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    maxGuests: v.maxGuests,
    pricePerNight: parseFloat(v.basePricePerNight),
    currency: '€',
    description: ((isEl && v.descriptionEl) || v.descriptionEn)
      .split('\n\n')
      .filter(Boolean),
    amenities: (isEl && v.amenitiesEl) || v.amenitiesEn || [],
    houseRules: (isEl && v.houseRulesEl) || v.houseRulesEn,
    checkInTime: (v.checkInTime as string) || '15:00',
    checkOutTime: (v.checkOutTime as string) || '11:00',
  };
}

export interface PublicContactInfo {
  ownerDisplayName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  streetAddress: string;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
}

interface PublicContactInfoResponse {
  data: PublicContactInfo;
}

export async function fetchPublicContactInfo(): Promise<PublicContactInfo> {
  const res = await api<PublicContactInfoResponse>('/api/villa/contact');
  return res.data;
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
