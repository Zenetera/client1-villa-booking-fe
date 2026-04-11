import { api } from './client';
import type {
  Booking,
  BookingDetail,
  BookingStatus,
  CreateBookingRequest,
  PaymentStatus,
  PriceBreakdown,
} from '../types/booking';

interface ApiResponse<T> {
  data: T;
}

export interface BookingStats {
  bookings: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    total: number;
    thisWeek: number;
  };
  revenue: {
    total: string;
    thisMonth: string;
    lastMonth: string;
    percentageChange: number;
  };
  occupancy: {
    bookedNightsThisMonth: number;
    daysInThisMonth: number;
    rate: number;
    percentageChange: number;
  };
  averages: { bookingValue: string; lengthOfStay: number };
  upcomingCheckIns: number;
  nextCheckIn: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    daysUntil: number;
  } | null;
  nextCheckOut: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    daysUntil: number;
    gapNightsToNext: number | null;
  } | null;
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ListBookingsParams {
  status?: BookingStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export async function listBookings(
  params: ListBookingsParams = {},
): Promise<BookingListResponse> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const res = await api<ApiResponse<BookingListResponse>>(
    `/api/admin/bookings${query ? `?${query}` : ''}`,
  );
  return res.data;
}

export async function fetchBookingStats(): Promise<BookingStats> {
  const res = await api<ApiResponse<BookingStats>>('/api/admin/bookings/stats');
  return res.data;
}

export async function getBooking(id: number): Promise<BookingDetail> {
  const res = await api<ApiResponse<BookingDetail>>(`/api/admin/bookings/${id}`);
  return res.data;
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  adminNotes?: string | null;
  cancellationReason?: string | null;
}

export async function updateBooking(
  id: number,
  payload: UpdateBookingPayload,
): Promise<Booking> {
  const res = await api<ApiResponse<Booking>>(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export interface OverlappingPending {
  id: number;
  referenceCode: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export async function fetchOverlappingPending(
  id: number,
): Promise<OverlappingPending[]> {
  const res = await api<ApiResponse<OverlappingPending[]>>(
    `/api/admin/bookings/${id}/overlapping-pending`,
  );
  return res.data;
}

export interface SubmitBookingResponse {
  booking: Booking;
  pricing: PriceBreakdown;
}

export async function submitBookingRequest(
  payload: CreateBookingRequest,
): Promise<SubmitBookingResponse> {
  const res = await api<ApiResponse<SubmitBookingResponse>>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function downloadBookingsCsv(): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('villa_admin_token');
  const res = await fetch(`${baseUrl}/api/admin/bookings/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
