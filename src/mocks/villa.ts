import type { Villa } from '../types/villa';

export const MOCK_VILLA: Villa = {
  id: 'sunset-villa',
  name: 'Sunset Villa',
  location: 'Amalfi Coast, Italy',
  tagline: 'A tranquil oceanfront escape with infinity pool',
  bedrooms: 4,
  bathrooms: 3,
  maxGuests: 8,
  pricePerNight: 850,
  currency: '$',
  description: [
    'Perched on a cliff overlooking the azure waters, Sunset Villa offers an unparalleled luxury experience. With floor-to-ceiling windows, a stunning infinity pool, and meticulously designed interiors, this retreat blends modern elegance with natural beauty.',
    'Wake up to panoramic ocean views, unwind in the private spa, or enjoy al fresco dining on the expansive terrace. Every detail has been curated for your comfort.',
  ],
  amenities: [
    'Pool',
    'Ocean View',
    'WiFi',
    'Air Conditioning',
    'Kitchen',
    'BBQ',
    'Garden',
  ],
};
