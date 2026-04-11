import { api } from './client';

// Villa details (admin)

export interface VillaAdmin {
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
  touristTaxPerNight: string;
  depositPercentage: string;
  minNights: number;
  maxNights: number | null;
  checkInTime: string;
  checkOutTime: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  amenitiesEn: string[];
  amenitiesEl: string[] | null;
  houseRulesEn: string | null;
  houseRulesEl: string | null;
}

interface VillaAdminResponse {
  data: VillaAdmin;
}

export async function fetchVillaAdmin(): Promise<VillaAdmin> {
  const res = await api<VillaAdminResponse>('/api/villa');
  return res.data;
}

export interface UpdateVillaInput {
  nameEn?: string;
  nameEl?: string | null;
  descriptionEn?: string;
  descriptionEl?: string | null;
  shortDescriptionEn?: string;
  shortDescriptionEl?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  basePricePerNight?: number;
  touristTaxPerNight?: number;
  depositPercentage?: number;
  minNights?: number;
  maxNights?: number | null;
  checkInTime?: string;
  checkOutTime?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  amenitiesEn?: string[];
  amenitiesEl?: string[] | null;
  houseRulesEn?: string | null;
  houseRulesEl?: string | null;
}

export async function updateVillaDetails(data: UpdateVillaInput): Promise<VillaAdmin> {
  const res = await api<VillaAdminResponse>('/api/admin/villa', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

// Villa pricing

interface VillaPricing {
  basePricePerNight: string;
  touristTaxPerNight: string;
  depositPercentage: string;
  minNights: number;
  maxNights: number | null;
}

interface VillaResponse {
  data: VillaPricing & { id: number };
}

export async function fetchVillaPricing(): Promise<VillaPricing & { id: number }> {
  const res = await api<VillaResponse>('/api/villa');
  return res.data;
}

export async function updateVillaPricing(data: {
  basePricePerNight?: number;
  touristTaxPerNight?: number;
  depositPercentage?: number;
  minNights?: number;
  maxNights?: number | null;
}): Promise<void> {
  await api('/api/admin/villa', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Pricing rules

export interface PricingRule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
  priority: number;
  createdAt: string;
}

interface PricingRulesResponse {
  data: PricingRule[];
}

interface PricingRuleResponse {
  data: PricingRule;
}

export async function fetchPricingRules(): Promise<PricingRule[]> {
  const res = await api<PricingRulesResponse>('/api/admin/pricing-rules');
  return res.data;
}

export interface CreatePricingRuleInput {
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  priority?: number;
}

export async function createPricingRule(data: CreatePricingRuleInput): Promise<PricingRule> {
  const res = await api<PricingRuleResponse>('/api/admin/pricing-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updatePricingRule(
  id: number,
  data: Partial<CreatePricingRuleInput>,
): Promise<PricingRule> {
  const res = await api<PricingRuleResponse>(`/api/admin/pricing-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deletePricingRule(id: number): Promise<void> {
  await api(`/api/admin/pricing-rules/${id}`, { method: 'DELETE' });
}

// Contact info

export interface ContactInfo {
  id: number;
  villaId: number;
  ownerFullName: string;
  ownerDisplayName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  streetAddress: string;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactInfoResponse {
  data: ContactInfo;
}

export async function fetchContactInfo(): Promise<ContactInfo> {
  const res = await api<ContactInfoResponse>('/api/admin/contact');
  return res.data;
}

export interface UpdateContactInput {
  ownerFullName: string;
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

export async function updateContactInfo(data: UpdateContactInput): Promise<ContactInfo> {
  const res = await api<ContactInfoResponse>('/api/admin/contact', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

// Villa images

export interface VillaImage {
  id: number;
  villaId: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isHero: boolean;
  createdAt: string;
}

interface VillaImagesResponse {
  data: VillaImage[];
}

interface VillaImageResponse {
  data: VillaImage;
}

export async function fetchImages(): Promise<VillaImage[]> {
  const res = await api<VillaImagesResponse>('/api/admin/images');
  return res.data;
}

export async function createImage(data: {
  imageUrl: string;
  altText: string;
}): Promise<VillaImage> {
  const res = await api<VillaImageResponse>('/api/admin/images', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateImage(
  id: number,
  data: { altText?: string; displayOrder?: number; isHero?: boolean },
): Promise<VillaImage> {
  const res = await api<VillaImageResponse>(`/api/admin/images/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function reorderImages(imageIds: number[]): Promise<VillaImage[]> {
  const res = await api<VillaImagesResponse>('/api/admin/images/reorder', {
    method: 'PUT',
    body: JSON.stringify({ imageIds }),
  });
  return res.data;
}

export async function deleteImage(id: number): Promise<void> {
  await api(`/api/admin/images/${id}`, { method: 'DELETE' });
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Missing Cloudinary config: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    throw new Error('Upload to Cloudinary failed');
  }

  const data = (await res.json()) as CloudinaryUploadResponse;
  if (!data.secure_url) {
    throw new Error('Cloudinary response missing secure_url');
  }
  return data.secure_url;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
}
