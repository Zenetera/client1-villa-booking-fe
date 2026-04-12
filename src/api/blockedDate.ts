import { api } from './client';

interface ApiResponse<T> {
  data: T;
}

export interface BlockedDate {
  id: number;
  villaId: number;
  date: string;
  reason: string;
  bookingId: number | null;
  createdAt: string;
}

function normalizeDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid blocked-date value: ${raw}`);
  }
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function listBlockedDates(
  scope: 'manual' | 'all' = 'manual',
  range?: { from?: string; to?: string },
): Promise<BlockedDate[]> {
  const qs = new URLSearchParams();
  qs.set('scope', scope);
  if (range?.from) qs.set('from', range.from);
  if (range?.to) qs.set('to', range.to);
  const res = await api<ApiResponse<BlockedDate[]>>(
    `/api/admin/blocked-dates?${qs.toString()}`,
  );
  return res.data.map((b) => ({ ...b, date: normalizeDate(b.date) }));
}

export async function createBlockedDates(
  startDate: string,
  endDate: string,
  reason: string = 'manual',
): Promise<{ created: number; total: number }> {
  const res = await api<ApiResponse<{ created: number; total: number }>>(
    '/api/admin/blocked-dates',
    {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate, reason }),
    },
  );
  return res.data;
}

export async function deleteBlockedDate(id: number): Promise<void> {
  await api(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
}

// Public availability — returns calendar days from the public endpoint
export interface AvailabilityDay {
  date: string;
  available: boolean;
  price: string | null;
  reason: string | null;
}

export interface AvailabilityResponse {
  villaId: number;
  minNights: number;
  maxNights: number | null;
  dates: AvailabilityDay[];
}

export async function fetchAvailability(
  from: string,
  to: string,
): Promise<AvailabilityResponse> {
  const res = await api<ApiResponse<AvailabilityResponse>>(
    `/api/availability?from=${from}&to=${to}`,
  );
  return res.data;
}

export async function fetchBlockedDates(
  from: string,
  to: string,
): Promise<string[]> {
  const availability = await fetchAvailability(from, to);
  return availability.dates.filter((d) => !d.available).map((d) => d.date);
}
