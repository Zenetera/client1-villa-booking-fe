export interface Villa {
  id: string;
  name: string;
  location: string;
  tagline: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  description: string[];
  amenities: string[];
  houseRules: string | null;
}
