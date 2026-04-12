import { useEffect, useState } from 'react';
import { X, AlertTriangle, Check, Ban, CheckCircle } from 'lucide-react';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Booking,
  type BookingDetail,
  type PaymentStatus,
} from '../../../types/booking';
import {
  fetchOverlappingPending,
  getBooking,
  updateBooking,
  type OverlappingPending,
} from '../../../api/booking';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDateFull, formatDateMedium } from '../../../utils/formatDate';
import styles from './BookingDetailModal.module.css';

interface BookingDetailModalProps {
  bookingId: number;
  onClose: () => void;
  onUpdated: (booking: Booking) => void;
}

type ActionKind = 'confirm' | 'cancel' | 'complete';

export function BookingDetailModal({ bookingId, onClose, onUpdated }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [overlaps, setOverlaps] = useState<OverlappingPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionKind | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [actionRunning, setActionRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getBooking(bookingId), fetchOverlappingPending(bookingId)])
      .then(([detail, overlapList]) => {
        if (cancelled) return;
        setBooking(detail);
        setOverlaps(overlapList);
        setNotes(detail.adminNotes ?? '');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load booking');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

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

  async function persist(field: string, payload: Parameters<typeof updateBooking>[1]) {
    if (!booking) return;
    setSavingField(field);
    try {
      const updated = await updateBooking(booking.id, payload);
      setBooking((prev) => (prev ? { ...prev, ...updated } : prev));
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSavingField(null);
    }
  }

  const handlePaymentChange = (next: PaymentStatus) => {
    void persist('paymentStatus', { paymentStatus: next });
  };

  const handleNotesBlur = () => {
    if (!booking) return;
    if ((booking.adminNotes ?? '') === notes) return;
    void persist('adminNotes', { adminNotes: notes });
  };

  const openActionModal = (kind: ActionKind) => {
    setCancelReasonInput('');
    setActionModal(kind);
  };

  const runAction = async () => {
    if (!booking || !actionModal) return;
    setActionRunning(true);
    try {
      const payload =
        actionModal === 'confirm'
          ? { status: 'confirmed' as const }
          : actionModal === 'complete'
          ? { status: 'completed' as const }
          : {
              status: 'cancelled' as const,
              cancellationReason: cancelReasonInput.trim() || 'Cancelled by admin',
            };
      const updated = await updateBooking(booking.id, payload);
      setBooking((prev) => (prev ? { ...prev, ...updated } : prev));
      onUpdated(updated);
      setActionModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionRunning(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Booking detail</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {loading && (
            <>
              <div className={styles.skeletonStatusRow}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className={styles.skeletonBadge} />
                  <div className={styles.skeletonRef} />
                </div>
                <div className={styles.skeletonDate} />
              </div>

              <div className={styles.skeletonSectionTitle} />
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`g${i}`} className={styles.skeletonGridCell}>
                    <div className={styles.skeletonCellLabel} />
                    <div className={styles.skeletonCellValue} />
                  </div>
                ))}
              </div>

              <div className={styles.skeletonSectionTitle} style={{ marginTop: '1.5rem' }} />
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`s${i}`} className={styles.skeletonGridCell}>
                    <div className={styles.skeletonCellLabel} />
                    <div className={styles.skeletonCellValue} />
                  </div>
                ))}
              </div>

              <div className={styles.skeletonSectionTitle} style={{ marginTop: '1.5rem' }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`p${i}`} className={styles.skeletonPriceLine} />
              ))}
              <div className={styles.skeletonTotal} />
            </>
          )}

          {error && (
            <div className={styles.alert} data-variant="error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {booking && (
            <>
              <div className={styles.statusRow}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusBadge} data-status={booking.status}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                  <code className={styles.refCode}>{booking.referenceCode}</code>
                </div>
                <div className={styles.statusRight}>
                  <span className={styles.submittedDate}>
                    Submitted {formatDateMedium(booking.createdAt.slice(0, 10))}
                  </span>
                </div>
              </div>

              {booking.status === 'pending' && overlaps.length > 0 && (
                <div className={styles.alert} data-variant="warning">
                  <AlertTriangle size={18} />
                  <span>
                    Overlapping pending request — confirming this will not auto-cancel others
                    ({overlaps.map((o) => o.referenceCode).join(', ')}).
                  </span>
                </div>
              )}

              <section className={styles.editControls}>
                <label className={styles.controlField}>
                  <span className={styles.controlLabel}>Payment</span>
                  <select
                    className={styles.controlSelect}
                    value={booking.paymentStatus}
                    onChange={(e) => handlePaymentChange(e.target.value as PaymentStatus)}
                    disabled={savingField === 'paymentStatus'}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>
              </section>

              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <section className={styles.actionButtons}>
                  {booking.status === 'pending' && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionConfirm}`}
                      onClick={() => openActionModal('confirm')}
                    >
                      <Check size={14} />
                      Confirm booking
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionComplete}`}
                      onClick={() => openActionModal('complete')}
                    >
                      <CheckCircle size={14} />
                      Mark completed
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionCancel}`}
                    onClick={() => openActionModal('cancel')}
                  >
                    <Ban size={14} />
                    Cancel booking
                  </button>
                </section>
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
                    <span className={styles.infoValue}>{booking.numGuests}</span>
                  </div>
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
                    <span className={styles.infoValue}>{formatDateFull(booking.checkIn)}</span>
                  </div>
                  <div className={styles.infoCell}>
                    <span className={styles.infoLabel}>Check-out</span>
                    <span className={styles.infoValue}>{formatDateFull(booking.checkOut)}</span>
                  </div>
                  <div className={styles.infoCell}>
                    <span className={styles.infoLabel}>Nights</span>
                    <span className={styles.infoValue}>{booking.numNights}</span>
                  </div>
                  <div className={styles.infoCell}>
                    <span className={styles.infoLabel}>Payment status</span>
                    <span className={styles.infoValue}>
                      {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className={styles.sectionTitle}>Price</h3>
                {booking.priceBreakdown ? (
                  <div className={styles.priceTable}>
                    {booking.priceBreakdown.nights.map((n, i) => (
                      <div key={i} className={styles.priceLine}>
                        <span className={styles.priceLabel}>
                          {n.date}
                          {n.ruleName ? ` · ${n.ruleName}` : ''}
                        </span>
                        <span className={styles.priceAmount}>€{n.price}</span>
                      </div>
                    ))}
                    <div className={styles.priceLine}>
                      <span className={styles.priceLabel}>Tourist tax</span>
                      <span className={styles.priceAmount}>
                        €{booking.priceBreakdown.touristTaxTotal}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.priceTable}>
                    <div className={styles.priceLine}>
                      <span className={styles.priceLabel}>Accommodation ({booking.numNights} nights)</span>
                      <span className={styles.priceAmount}>
                        €{(parseFloat(booking.totalPrice) - parseFloat(booking.touristTaxTotal)).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.priceLine}>
                      <span className={styles.priceLabel}>Tourist tax</span>
                      <span className={styles.priceAmount}>€{booking.touristTaxTotal}</span>
                    </div>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>{formatCurrency(booking.totalPrice)}</span>
                </div>
              </section>

              {booking.guestMessage && (
                <section>
                  <h3 className={styles.sectionTitle}>Guest Message</h3>
                  <div className={styles.messageBox}>
                    <p>{booking.guestMessage}</p>
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
                  onBlur={handleNotesBlur}
                  placeholder="Add internal notes (not visible to guest)..."
                  disabled={savingField === 'adminNotes'}
                />
              </section>

              {booking.status === 'cancelled' && booking.cancellationReason && (
                <section>
                  <h3 className={styles.sectionTitle}>Cancellation reason</h3>
                  <div className={styles.messageBox}>
                    <p>{booking.cancellationReason}</p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {actionModal && booking && (
          <div
            className={styles.actionBackdrop}
            onClick={() => !actionRunning && setActionModal(null)}
          >
            <div className={styles.actionModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.actionModalHeader}>
                <h3>
                  {actionModal === 'confirm' && 'Confirm this booking?'}
                  {actionModal === 'complete' && 'Mark booking as completed?'}
                  {actionModal === 'cancel' && 'Cancel this booking?'}
                </h3>
                <button
                  type="button"
                  className={styles.actionModalClose}
                  onClick={() => setActionModal(null)}
                  disabled={actionRunning}
                >
                  <X size={16} />
                </button>
              </div>
              <div className={styles.actionModalBody}>
                <p>
                  <strong>{booking.guestName}</strong> · {booking.referenceCode}
                </p>
                {actionModal === 'confirm' && (
                  <p>The guest will receive a confirmation email and these dates will be blocked.</p>
                )}
                {actionModal === 'complete' && (
                  <p>This marks the stay as completed. This cannot be undone.</p>
                )}
                {actionModal === 'cancel' && (
                  <>
                    <p>The guest will receive a cancellation email.</p>
                    <label className={styles.cancelReasonLabel}>
                      Reason (optional)
                      <textarea
                        className={styles.cancelReasonInput}
                        rows={3}
                        value={cancelReasonInput}
                        onChange={(e) => setCancelReasonInput(e.target.value)}
                        placeholder="A default message will be sent if left empty"
                        disabled={actionRunning}
                      />
                    </label>
                  </>
                )}
              </div>
              <div className={styles.actionModalFooter}>
                <button
                  type="button"
                  className={styles.actionModalCancel}
                  onClick={() => setActionModal(null)}
                  disabled={actionRunning}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`${styles.actionModalConfirm} ${
                    actionModal === 'cancel' ? styles.actionModalDanger : ''
                  }`}
                  onClick={() => void runAction()}
                  disabled={actionRunning}
                >
                  {actionRunning
                    ? 'Working…'
                    : actionModal === 'confirm'
                    ? 'Confirm booking'
                    : actionModal === 'complete'
                    ? 'Mark completed'
                    : 'Cancel booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
