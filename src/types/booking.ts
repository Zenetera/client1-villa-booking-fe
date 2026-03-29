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
