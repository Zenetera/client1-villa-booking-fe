export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Paid';

export interface PriceLineItem {
  label: string;
  nights: number;
  amount: number;
}

export interface Booking {
  referenceCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  submittedAt: string;
  specialRequests: string;
  priceBreakdown: PriceLineItem[];
  adminNotes: string;
}

export interface BookingRequest {
  villaId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}
