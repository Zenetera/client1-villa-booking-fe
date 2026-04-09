export interface Villa {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  tagline: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  description: string[];
  amenities: string[];
  houseRules: string | null;
  checkInTime: string;
  checkOutTime: string;
}
