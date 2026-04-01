import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Booking, PaymentStatus } from '../../../types/booking';
import { findOverlaps } from '../../../utils/bookingOverlap';
import styles from './BookingDetailModal.module.css';

interface BookingDetailModalProps {
  booking: Booking;
  allBookings: Booking[];
  onClose: () => void;
  onConfirm: (refCode: string) => void;
  onReject: (refCode: string) => void;
  onSaveNotes: (refCode: string, notes: string) => void;
  onPaymentChange?: (refCode: string, paymentStatus: PaymentStatus) => void;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSubmittedDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function BookingDetailModal({
  booking,
  allBookings,
  onClose,
  onConfirm,
  onReject,
  onSaveNotes,
  onPaymentChange,
}: BookingDetailModalProps) {
  const [notes, setNotes] = useState(booking.adminNotes);

  const overlaps = findOverlaps(booking, allBookings);
  const confirmedOverlaps = overlaps.filter((o) => o.status === 'confirmed');
  const pendingOverlaps = overlaps.filter((o) => o.status === 'pending');
  const hasConfirmedOverlap = confirmedOverlaps.length > 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Booking detail</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.statusRow}>
            <div className={styles.statusLeft}>
              <span className={styles.statusBadge} data-status={booking.status}>
                {STATUS_LABELS[booking.status]}
              </span>
              <code className={styles.refCode}>{booking.referenceCode}</code>
            </div>
            <div className={styles.statusRight}>
              <span className={styles.submittedDate}>
                Submitted {formatSubmittedDate(booking.submittedAt)}
              </span>
            </div>
          </div>

          <div className={styles.paymentSection}>
            <span className={styles.paymentLabel}>Payment Status:</span>
            <select
              className={styles.paymentSelect}
              value={booking.paymentStatus || 'Unpaid'}
              onChange={(e) => onPaymentChange?.(booking.referenceCode, e.target.value as PaymentStatus)}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Deposit Paid">Deposit Paid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {booking.status === 'pending' && hasConfirmedOverlap && (
            <div className={styles.alert} data-variant="error">
              <AlertTriangle size={18} />
              <span>
                <strong>Booking blocked</strong> — a confirmed booking (
                {confirmedOverlaps.map((o) => o.referenceCode).join(', ')}) overlaps{' '}
                {formatOverlapRange(booking, confirmedOverlaps[0])}. You must cancel
                the confirmed booking before confirming this one.
              </span>
            </div>
          )}

          {booking.status === 'pending' && !hasConfirmedOverlap && pendingOverlaps.length > 0 && (
            <div className={styles.alert} data-variant="warning">
              <AlertTriangle size={18} />
              <span>
                Date overlap detected — another pending request (
                {pendingOverlaps
                  .map((o) => `${o.referenceCode}, ${o.guestName}`)
                  .join('; ')}
                ) overlaps {formatOverlapRange(booking, pendingOverlaps[0])}.
                Confirming this booking will not auto-reject the other.
              </span>
            </div>
          )}

          <section>
            <h3 className={styles.sectionTitle}>Guest Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{booking.guestName}</span>
              </div>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Guests</span>
                <span className={styles.infoValue}>{booking.guests}</span>
              </div>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Email</span>
                <a href={`mailto:${booking.guestEmail}`} className={styles.infoLink}>
                  {booking.guestEmail}
                </a>
              </div>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{booking.guestPhone}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className={styles.sectionTitle}>Stay Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Check-in</span>
                <span className={styles.infoValue}>{formatFullDate(booking.checkIn)}</span>
              </div>
              <div className={styles.infoCell}>
                <span className={styles.infoLabel}>Check-out</span>
                <span className={styles.infoValue}>{formatFullDate(booking.checkOut)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className={styles.sectionTitle}>Price Breakdown (Snapshot)</h3>
            <div className={styles.priceTable}>
              {booking.priceBreakdown.map((line, i) => (
                <div key={i} className={styles.priceLine}>
                  <span className={styles.priceLabel}>{line.label}</span>
                  <span className={styles.priceNights}>
                    {line.nights} night{line.nights !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.priceAmount}>
                    &euro;{line.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>
                &euro;{booking.totalPrice.toLocaleString()}
              </span>
            </div>
          </section>

          {booking.specialRequests && (
            <section>
              <h3 className={styles.sectionTitle}>Guest Message</h3>
              <div className={styles.messageBox}>
                <p>{booking.specialRequests}</p>
              </div>
            </section>
          )}

          <section>
            <h3 className={styles.sectionTitle}>Admin Notes</h3>
            <textarea
              className={styles.notesInput}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes (not visible to guest)..."
            />
          </section>
        </div>

        {booking.status === 'pending' && (
          <div className={styles.footer}>
            <button
              className={styles.rejectButton}
              onClick={() => onReject(booking.referenceCode)}
            >
              Reject
            </button>
            <button
              className={styles.saveNotesButton}
              onClick={() => onSaveNotes(booking.referenceCode, notes)}
            >
              Save notes
            </button>
            <button
              className={styles.confirmButton}
              onClick={() => onConfirm(booking.referenceCode)}
              disabled={hasConfirmedOverlap}
              title={
                hasConfirmedOverlap
                  ? 'Cannot confirm — dates overlap with a confirmed booking'
                  : undefined
              }
            >
              Confirm booking
            </button>
          </div>
        )}

        {booking.status !== 'pending' && (
          <div className={styles.footer}>
            <button
              className={styles.saveNotesButton}
              onClick={() => onSaveNotes(booking.referenceCode, notes)}
            >
              Save notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatOverlapRange(booking: Booking, overlap: Booking): string {
  const bIn = new Date(booking.checkIn + 'T00:00:00');
  const bOut = new Date(booking.checkOut + 'T00:00:00');
  const oIn = new Date(overlap.checkIn + 'T00:00:00');
  const oOut = new Date(overlap.checkOut + 'T00:00:00');

  const overlapStart = bIn > oIn ? bIn : oIn;
  const overlapEnd = bOut < oOut ? bOut : oOut;

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

  return `${fmt(overlapStart)}–${fmt(overlapEnd)}`;
}
