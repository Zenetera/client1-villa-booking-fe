import type { Booking } from '../types/booking';

/**
 * Returns true if two date ranges [aIn, aOut) and [bIn, bOut) overlap.
 * Check-out day is not considered occupied (a guest checking out on Jun 19
 * does not conflict with a guest checking in on Jun 19).
 */
function datesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut;
}

/**
 * Given a booking, returns all other bookings whose dates overlap with it.
 * Only considers bookings that are pending or confirmed (completed and
 * cancelled bookings don't occupy dates).
 */
export function findOverlaps(booking: Booking, allBookings: Booking[]): Booking[] {
  return allBookings.filter(
    (other) =>
      other.referenceCode !== booking.referenceCode &&
      (other.status === 'pending' || other.status === 'confirmed') &&
      datesOverlap(booking.checkIn, booking.checkOut, other.checkIn, other.checkOut),
  );
}

/**
 * Returns true if confirming this booking would conflict with an already
 * confirmed booking. Used to block the confirm action.
 */
export function hasConfirmedConflict(booking: Booking, allBookings: Booking[]): boolean {
  return allBookings.some(
    (other) =>
      other.referenceCode !== booking.referenceCode &&
      other.status === 'confirmed' &&
      datesOverlap(booking.checkIn, booking.checkOut, other.checkIn, other.checkOut),
  );
}
