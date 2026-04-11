export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid';

export interface PriceNight {
  date: string;
  price: string;
  ruleName: string | null;
}

export interface PriceBreakdown {
  numNights: number;
  nights: PriceNight[];
  accommodationTotal: string;
  nightlyRate: string;
  touristTaxPerNight: string;
  touristTaxTotal: string;
  totalPrice: string;
}

export interface Booking {
  id: number;
  referenceCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numGuests: number;
  checkIn: string;
  checkOut: string;
  numNights: number;
  nightlyRate: string;
  touristTaxTotal: string;
  totalPrice: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  guestMessage: string | null;
  adminNotes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

export interface BookingDetail extends Booking {
  villa?: {
    nameEn: string;
    address: string;
    checkInTime: string;
    checkOutTime: string;
  };
  priceBreakdown?: PriceBreakdown | null;
}

export interface CreateBookingRequest {
  checkIn: string;
  checkOut: string;
  numGuests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestMessage?: string;
}

export interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit Paid',
  paid: 'Paid',
};
