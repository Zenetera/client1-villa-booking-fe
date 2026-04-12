import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, X } from 'lucide-react';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
} from '../../../types/booking';

const PAYMENT_OPTIONS: PaymentStatus[] = ['unpaid', 'deposit_paid', 'paid'];
import {
  downloadBookingsCsv,
  fetchBookingStats,
  listBookings,
  updateBooking,
  type BookingStats,
} from '../../../api/booking';
import { BookingDetailModal } from '../../../components/admin/BookingDetailModal';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDateShort } from '../../../utils/formatDate';
import styles from './BookingsListPage.module.css';

type FilterOption = 'all' | BookingStatus;
const PAGE_SIZE = 12;

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [paymentDropdownId, setPaymentDropdownId] = useState<number | null>(null);
  const [paymentDropdownPos, setPaymentDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const paymentBadgeRefs = useRef<Set<HTMLButtonElement>>(new Set());
  const [paymentUpdating, setPaymentUpdating] = useState<number | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<Booking | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch stats once on mount
  useEffect(() => {
    fetchBookingStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // Fetch bookings on filter/search/page change
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listBookings({
        status: activeFilter,
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setBookings(res.bookings);
      setPagination({
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
        total: res.pagination.total,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, page]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(e.target as Node)) {
        const target = e.target as Node;
        const clickedBadge = Array.from(paymentBadgeRefs.current).some((el) =>
          el.contains(target),
        );
        if (!clickedBadge) {
          setPaymentDropdownId(null);
          setPaymentDropdownPos(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (paymentDropdownId === null) return;
    const close = () => {
      setPaymentDropdownId(null);
      setPaymentDropdownPos(null);
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [paymentDropdownId]);

  const togglePaymentDropdown = (bookingId: number, btn: HTMLButtonElement) => {
    if (paymentDropdownId === bookingId) {
      setPaymentDropdownId(null);
      setPaymentDropdownPos(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    setPaymentDropdownPos({ top: rect.bottom + 4, left: rect.left });
    setPaymentDropdownId(bookingId);
  };

  const replaceBooking = useCallback((updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
  }, []);

  const handlePaymentChange = async (booking: Booking, next: PaymentStatus) => {
    setPaymentDropdownId(null);
    if (booking.paymentStatus === next) return;
    setPaymentUpdating(booking.id);
    try {
      const updated = await updateBooking(booking.id, { paymentStatus: next });
      replaceBooking(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update payment');
    } finally {
      setPaymentUpdating(null);
    }
  };

  const handleConfirmFromModal = async () => {
    if (!confirmModal) return;
    setConfirming(true);
    try {
      const updated = await updateBooking(confirmModal.id, { status: 'confirmed' });
      replaceBooking(updated);
      setConfirmModal(null);
      void fetchBookingStats().then(setStats).catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadBookingsCsv();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, pagination.totalPages);
  const safePage = Math.min(page, totalPages);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <div className={styles.headerControls}>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={13} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statsTop}>
          <div className={styles.statCol}>
            <span className={styles.statLabel}>Revenue this month</span>
            <span className={styles.statValueHuge}>
              {stats ? formatCurrency(stats.revenue.thisMonth) : '—'}
            </span>
            {stats && (
              <span
                className={
                  stats.revenue.percentageChange >= 0
                    ? styles.trendPillUp
                    : styles.trendPillDown
                }
              >
                {stats.revenue.percentageChange >= 0 ? '↑' : '↓'}
                {Math.abs(stats.revenue.percentageChange)}% vs last month
              </span>
            )}
          </div>

          <div className={styles.statCol}>
            <span className={styles.statLabel}>Occupancy this month</span>
            <div className={styles.valueWithUnit}>
              <span className={styles.statValueHuge}>
                {stats ? stats.occupancy.rate : '—'}
              </span>
              {stats && <span className={styles.statUnit}>%</span>}
            </div>
            {stats && (
              <span
                className={
                  stats.occupancy.percentageChange >= 0
                    ? styles.trendTextUp
                    : styles.trendTextDown
                }
              >
                {stats.occupancy.percentageChange >= 0 ? '↑' : '↓'}
                {Math.abs(stats.occupancy.percentageChange)}% vs last month
              </span>
            )}
            {stats && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(100, stats.occupancy.rate)}%` }}
                />
              </div>
            )}
          </div>

          <div className={styles.statCol}>
            <div className={styles.statSplitRow}>
              <span className={styles.statLabel}>Total bookings</span>
              <div className={styles.valueWithBadge}>
                <span className={styles.statValueHuge}>
                  {stats ? stats.bookings.total : '—'}
                </span>
                {stats && stats.bookings.thisWeek > 0 && (
                  <span className={styles.trendTextUp}>
                    +{stats.bookings.thisWeek} this week
                  </span>
                )}
              </div>
            </div>
            <div className={styles.statSplitRowBottom}>
              <span className={styles.statLabel}>Avg nights</span>
              <span className={styles.statValueMedium}>
                {stats ? stats.averages.lengthOfStay : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statsDividerGroup}>
          <div className={styles.statsDividerLine} />
          <div className={styles.statsDividerLine} />
        </div>

        <div className={styles.statsBottom}>
          <div className={styles.pendingCol}>
            <span className={styles.statLabel}>Pending requests</span>
            <div className={styles.pendingRow}>
              <span className={styles.pendingDotLarge} />
              <span className={styles.statValueMedium}>
                {stats ? stats.bookings.pending : '—'}
              </span>
              <span className={styles.mutedText}>awaiting review</span>
            </div>
          </div>

          <div className={styles.nextGroup}>
            <div className={styles.nextItem}>
              <span className={styles.statLabel}>Next check-in</span>
              {stats?.nextCheckIn ? (
                <>
                  <span className={styles.nextGuest}>{stats.nextCheckIn.guestName}</span>
                  <span className={styles.nextDate}>
                    {formatDateShort(stats.nextCheckIn.checkIn)}
                    {stats.nextCheckIn.daysUntil >= 0 &&
                      ` · in ${stats.nextCheckIn.daysUntil}d`}
                  </span>
                </>
              ) : (
                <span className={styles.nextGuest}>—</span>
              )}
            </div>

            <div className={styles.nextItem}>
              <span className={styles.statLabel}>Next check-out</span>
              {stats?.nextCheckOut ? (
                <>
                  <span className={styles.nextGuest}>{stats.nextCheckOut.guestName}</span>
                  <span className={styles.nextDate}>
                    {formatDateShort(stats.nextCheckOut.checkOut)}
                  </span>
                </>
              ) : (
                <span className={styles.nextGuest}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search guest or reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.statusDropdownWrapper} ref={statusDropdownRef}>
          <button
            type="button"
            className={`${styles.statusButton} ${statusDropdownOpen ? styles.statusButtonOpen : ''}`}
            onClick={() => setStatusDropdownOpen((o) => !o)}
          >
            <span className={styles.statusLabel}>Status</span>
            {FILTER_OPTIONS.find((f) => f.key === activeFilter)?.label}
            <ChevronDown size={12} className={statusDropdownOpen ? styles.chevronOpen : ''} />
          </button>
          {statusDropdownOpen && (
            <div className={styles.dropdown}>
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.dropdownItem} ${activeFilter === f.key ? styles.dropdownItemActive : ''}`}
                  onClick={() => {
                    setActiveFilter(f.key);
                    setPage(1);
                    setStatusDropdownOpen(false);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.mobileCards}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`sc${i}`} className={styles.card}>
              <div className={styles.skeletonRow} />
            </div>
          ))
        ) : bookings.length === 0 ? (
          <div className={styles.emptyState}>No bookings found.</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedBookingId(booking.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBookingId(booking.id);
                }
              }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardGuest}>
                  <div className={styles.cardGuestName}>{booking.guestName}</div>
                  <div className={styles.cardRef}>{booking.referenceCode}</div>
                </div>
                <div className={styles.cardStatus}>
                  <span className={styles.status} data-status={booking.status}>
                    <span className={styles.statusDot} />
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>
              </div>

              <div className={styles.cardDetails}>
                <div>
                  <div className={styles.cardDetailLabel}>Check-in</div>
                  <div className={styles.cardDetailValue}>
                    {formatDateShort(booking.checkIn)}
                  </div>
                </div>
                <div>
                  <div className={styles.cardDetailLabel}>Check-out</div>
                  <div className={styles.cardDetailValue}>
                    {formatDateShort(booking.checkOut)}
                  </div>
                </div>
                <div>
                  <div className={styles.cardDetailLabel}>Nights</div>
                  <div className={styles.cardDetailValue}>{booking.numNights}</div>
                </div>
                <div>
                  <div className={styles.cardDetailLabel}>Total</div>
                  <div className={styles.cardDetailValue}>
                    <strong>{formatCurrency(booking.totalPrice)}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div
                  className={styles.paymentStatusWrapper}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) paymentBadgeRefs.current.add(el);
                    }}
                    className={styles.paymentBadge}
                    data-payment={booking.paymentStatus}
                    disabled={paymentUpdating === booking.id}
                    onClick={(e) => togglePaymentDropdown(booking.id, e.currentTarget)}
                  >
                    <span className={styles.paymentDot} />
                    {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
                  </button>
                </div>
                <div className={styles.actions}>
                  {booking.status === 'pending' && (
                    <button
                      type="button"
                      className={`${styles.actionIcon} ${styles.confirm}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal(booking);
                      }}
                      title="Confirm booking"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.actionIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBookingId(booking.id);
                    }}
                    title="View booking"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col style={{ width: '11%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th className={styles.colNights}>Nights</th>
              <th className={styles.colTotal}>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th className={styles.colActions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`s${i}`}>
                    <td colSpan={9}>
                      <div className={styles.skeletonRow} />
                    </td>
                  </tr>
                ))
              : bookings.length === 0
              ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    No bookings found.
                  </td>
                </tr>
              )
              : bookings.map((booking) => (
                  <tr key={booking.id} onClick={() => setSelectedBookingId(booking.id)}>
                    <td>
                      <span className={styles.refCode}>{booking.referenceCode}</span>
                    </td>
                    <td>
                      <div className={styles.guestInfo}>
                        <span className={styles.guestName}>{booking.guestName}</span>
                        <span className={styles.guestEmail}>{booking.guestEmail}</span>
                      </div>
                    </td>
                    <td>{formatDateShort(booking.checkIn)}</td>
                    <td>{formatDateShort(booking.checkOut)}</td>
                    <td className={styles.colNights}>{booking.numNights}</td>
                    <td className={`${styles.colTotal} ${styles.price}`}>
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td>
                      <div
                        className={styles.paymentStatusWrapper}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) paymentBadgeRefs.current.add(el);
                          }}
                          className={styles.paymentBadge}
                          data-payment={booking.paymentStatus}
                          disabled={paymentUpdating === booking.id}
                          onClick={(e) => togglePaymentDropdown(booking.id, e.currentTarget)}
                        >
                          <span className={styles.paymentDot} />
                          {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={styles.status} data-status={booking.status}>
                        <span className={styles.statusDot} />
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className={styles.colActions}>
                      <div className={styles.actions}>
                        {booking.status === 'pending' && (
                          <button
                            type="button"
                            className={`${styles.actionIcon} ${styles.confirm}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal(booking);
                            }}
                            title="Confirm booking"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.actionIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingId(booking.id);
                          }}
                          title="View booking"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Page {safePage} of {totalPages} · {pagination.total} bookings
          </span>
          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.paginationBtn} ${n === safePage ? styles.paginationBtnActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {confirmModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !confirming && setConfirmModal(null)}
        >
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <h3>Confirm booking?</h3>
              <button
                type="button"
                className={styles.confirmClose}
                onClick={() => setConfirmModal(null)}
                disabled={confirming}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.confirmBody}>
              <p><strong>{confirmModal.guestName}</strong></p>
              <p>
                {formatDateShort(confirmModal.checkIn)} → {formatDateShort(confirmModal.checkOut)}
                {' · '}{confirmModal.numNights} nights
              </p>
              <p className={styles.confirmTotal}>{formatCurrency(confirmModal.totalPrice)}</p>
              <p className={styles.confirmRef}>{confirmModal.referenceCode}</p>
            </div>
            <div className={styles.confirmFooter}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setConfirmModal(null)}
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmConfirmBtn}
                onClick={handleConfirmFromModal}
                disabled={confirming}
              >
                {confirming ? 'Confirming…' : 'Confirm booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBookingId !== null && (
        <BookingDetailModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onUpdated={(updated) => {
            replaceBooking(updated);
            void fetchBookingStats().then(setStats).catch(() => undefined);
          }}
        />
      )}

      {paymentDropdownId !== null &&
        paymentDropdownPos &&
        (() => {
          const booking = bookings.find((b) => b.id === paymentDropdownId);
          if (!booking) return null;
          return createPortal(
            <div
              ref={paymentDropdownRef}
              className={styles.paymentDropdown}
              style={{ top: paymentDropdownPos.top, left: paymentDropdownPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`${styles.paymentDropdownItem} ${
                    booking.paymentStatus === opt ? styles.paymentDropdownItemActive : ''
                  }`}
                  onClick={() => void handlePaymentChange(booking, opt)}
                >
                  {PAYMENT_STATUS_LABELS[opt]}
                </button>
              ))}
            </div>,
            document.body,
          );
        })()}
    </div>
  );
}
