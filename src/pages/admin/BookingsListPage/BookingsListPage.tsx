import { useEffect, useRef, useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';
import type { Booking, BookingStatus, PaymentStatus } from '../../../types/booking';
import { MOCK_BOOKINGS } from '../../../mocks/data';
import { hasConfirmedConflict } from '../../../utils/bookingOverlap';
import { BookingDetailModal } from '../../../components/admin/BookingDetailModal';
import styles from './BookingsListPage.module.css';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

type FilterOption = 'all' | BookingStatus;

const DATE_RANGE_OPTIONS = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'year', label: 'This year' },
  { key: 'all', label: 'All time' },
] as const;

type DateRangeKey = (typeof DATE_RANGE_OPTIONS)[number]['key'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function daysUntil(dateStr: string, today: Date): number {
  return Math.round(
    (new Date(dateStr + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatGapRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-GB', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-GB', { month: 'short' });
  if (sMonth === eMonth) return `${sMonth} ${s.getDate()}–${e.getDate()}`;
  return `${sMonth} ${s.getDate()}–${eMonth} ${e.getDate()}`;
}

function findNextGap(
  confirmed: Booking[],
  today: Date,
): { nights: number; start: string; end: string } | null {
  const sorted = [...confirmed]
    .filter((b) => new Date(b.checkOut + 'T00:00:00') >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = sorted[i].checkOut;
    const gapEnd = sorted[i + 1].checkIn;
    const gapNights = Math.round(
      (new Date(gapEnd + 'T00:00:00').getTime() - new Date(gapStart + 'T00:00:00').getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (gapNights > 0) return { nights: gapNights, start: gapStart, end: gapEnd };
  }
  return null;
}

function exportCSV(bookings: Booking[]) {
  const headers = ['Reference', 'Guest Name', 'Email', 'Check-in', 'Check-out', 'Nights', 'Total (€)', 'Status'];
  const rows = bookings.map((b) => [
    b.referenceCode,
    b.guestName,
    b.guestEmail,
    b.checkIn,
    b.checkOut,
    b.nights,
    b.totalPrice,
    b.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ITEMS_PER_PAGE = 12;

export function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exportStatuses, setExportStatuses] = useState<Set<BookingStatus>>(
    new Set(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]),
  );
  const exportRef = useRef<HTMLDivElement>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState<string | null>(null);
  const paymentDropdownRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      // Close payment dropdowns if clicking outside
      Object.values(paymentDropdownRef.current).forEach((ref) => {
        if (ref && !ref.contains(e.target as Node)) {
          setPaymentDropdownOpen(null);
        }
      });
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const relevantForAvg = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed',
  );
  const avgNights =
    relevantForAvg.length > 0
      ? Math.round((relevantForAvg.reduce((s, b) => s + b.nights, 0) / relevantForAvg.length) * 10) / 10
      : 0;

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const confirmedSorted = [...confirmedBookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const nextCheckin = confirmedSorted.find((b) => new Date(b.checkIn + 'T00:00:00') >= today) ?? null;
  const nextCheckout =
    [...confirmedBookings]
      .filter((b) => new Date(b.checkOut + 'T00:00:00') >= today)
      .sort((a, b) => a.checkOut.localeCompare(b.checkOut))[0] ?? null;
  const nextGap = findNextGap(confirmedBookings, today);

  const filtered = bookings
    .filter((b) => activeFilter === 'all' || b.status === activeFilter)
    .filter((b) => {
      const q = search.toLowerCase();
      return !q || b.guestName.toLowerCase().includes(q) || b.referenceCode.toLowerCase().includes(q);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(paginatedStart, paginatedStart + ITEMS_PER_PAGE);


  const filters: { key: FilterOption; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'confirmed', label: 'Confirmed', count: confirmedCount },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleConfirm = (refCode: string) => {
    setBookings((prev) => {
      const target = prev.find((b) => b.referenceCode === refCode);
      if (!target) return prev;
      if (hasConfirmedConflict(target, prev)) return prev;
      return prev.map((b) =>
        b.referenceCode === refCode ? { ...b, status: 'confirmed' as const } : b,
      );
    });
    setSelectedBooking(null);
  };

  const handleReject = (refCode: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.referenceCode === refCode ? { ...b, status: 'cancelled' as const } : b,
      ),
    );
    setSelectedBooking(null);
  };

  const handleSaveNotes = (refCode: string, notes: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.referenceCode === refCode ? { ...b, adminNotes: notes } : b)),
    );
    if (selectedBooking?.referenceCode === refCode) {
      setSelectedBooking((prev) => prev ? { ...prev, adminNotes: notes } : null);
    }
  };

  const handlePaymentChange = (refCode: string, paymentStatus: PaymentStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.referenceCode === refCode ? { ...b, paymentStatus } : b)),
    );
    if (selectedBooking?.referenceCode === refCode) {
      setSelectedBooking((prev) => prev ? { ...prev, paymentStatus } : null);
    }
  };

  const handleTableConfirm = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    if (hasConfirmedConflict(booking, bookings)) return;
    handleConfirm(booking.referenceCode);
  };

  const toggleExportStatus = (status: BookingStatus) => {
    setExportStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const exportBookings = bookings.filter((b) => {
    if (!exportStatuses.has(b.status)) return false;
    if (exportDateFrom && b.checkIn < exportDateFrom) return false;
    if (exportDateTo && b.checkIn > exportDateTo) return false;
    return true;
  });

  const selectedDateLabel = DATE_RANGE_OPTIONS.find((o) => o.key === dateRange)?.label ?? 'Last 30 days';

  const checkinDays = nextCheckin ? daysUntil(nextCheckin.checkIn, today) : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <div className={styles.headerControls}>
          <div className={styles.dateRangeWrapper} ref={dropdownRef}>
            <button
              className={`${styles.dateRangeBtn} ${dropdownOpen ? styles.dateRangeBtnOpen : ''}`}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <Calendar size={13} />
              {selectedDateLabel}
              <ChevronDown size={12} className={dropdownOpen ? styles.chevronOpen : ''} />
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    className={`${styles.dropdownItem} ${dateRange === opt.key ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setDateRange(opt.key); setCurrentPage(1); setDropdownOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.exportWrapper} ref={exportRef}>
            <button
              className={`${styles.exportButton} ${exportOpen ? styles.exportButtonOpen : ''}`}
              onClick={() => setExportOpen((o) => !o)}
            >
              <Download size={13} />
              Export
              <ChevronDown size={12} className={exportOpen ? styles.chevronOpen : ''} />
            </button>
            {exportOpen && (
              <div className={styles.exportPanel}>
                <div className={styles.exportPanelSection}>
                  <span className={styles.exportPanelLabel}>CHECK-IN DATE RANGE</span>
                  <div className={styles.exportDateRow}>
                    <input
                      type="date"
                      className={styles.exportDateInput}
                      value={exportDateFrom}
                      onChange={(e) => setExportDateFrom(e.target.value)}
                    />
                    <span className={styles.exportDateSep}>–</span>
                    <input
                      type="date"
                      className={styles.exportDateInput}
                      value={exportDateTo}
                      onChange={(e) => setExportDateTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.exportPanelSection}>
                  <span className={styles.exportPanelLabel}>STATUS</span>
                  <div className={styles.exportStatusRow}>
                    {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((s) => (
                      <button
                        key={s}
                        className={`${styles.exportStatusChip} ${exportStatuses.has(s) ? styles.exportStatusChipActive : ''}`}
                        onClick={() => toggleExportStatus(s)}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.exportFooter}>
                  <span className={styles.exportCount}>{exportBookings.length} booking{exportBookings.length !== 1 ? 's' : ''}</span>
                  <button
                    className={styles.exportSubmit}
                    disabled={exportBookings.length === 0}
                    onClick={() => { exportCSV(exportBookings); setExportOpen(false); }}
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            &euro;{totalRevenue.toLocaleString('en', { minimumFractionDigits: 0 })}
          </span>
          <span className={styles.statLabel}>Revenue</span>
          <span className={`${styles.statTrend} ${styles.trendUp}`}>+12% vs last month</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>68%</span>
          <span className={styles.statLabel}>Occupancy Jun–Aug</span>
          <span className={`${styles.statTrend} ${styles.trendDown}`}>-3% vs last year</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{bookings.length}</span>
          <span className={styles.statLabel}>Total bookings</span>
          <span className={`${styles.statTrend} ${styles.trendUp}`}>+2 this week</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{avgNights}</span>
          <span className={styles.statLabel}>Avg nights</span>
          <span className={`${styles.statTrend} ${styles.trendNeutral}`}>Stable</span>
        </div>
      </div>

      <div className={styles.opsStrip}>
        <div className={styles.opsItem}>
          <span className={styles.opsLabel}>Next check-in</span>
          {nextCheckin ? (
            <span className={styles.opsValue}>
              <span className={styles.opsGuest}>{nextCheckin.guestName}</span>
              <span className={styles.opsDate}>{formatDate(nextCheckin.checkIn)}</span>
              {checkinDays !== null && (
                <span className={checkinDays <= 3 ? styles.opsDayBadgeUrgent : styles.opsDayBadge}>
                  {checkinDays === 0 ? 'today' : checkinDays === 1 ? 'tomorrow' : `in ${checkinDays}d`}
                </span>
              )}
            </span>
          ) : (
            <span className={styles.opsEmpty}>—</span>
          )}
        </div>

        <div className={styles.opsItem}>
          <span className={styles.opsLabel}>Next check-out</span>
          {nextCheckout ? (
            <span className={styles.opsValue}>
              <span className={styles.opsGuest}>{nextCheckout.guestName}</span>
              <span className={styles.opsDate}>{formatDate(nextCheckout.checkOut)}</span>
            </span>
          ) : (
            <span className={styles.opsEmpty}>—</span>
          )}
        </div>

        <div className={styles.opsItem}>
          <span className={styles.opsLabel}>Pending requests</span>
          <span className={styles.opsValue}>
            {pendingCount > 0 && <span className={styles.pendingDot} />}
            <span className={styles.opsGuest}>{pendingCount}</span>
            <span className={styles.opsDate}>awaiting review</span>
          </span>
        </div>

        <div className={styles.opsItem}>
          <span className={styles.opsLabel}>Gap nights</span>
          {nextGap ? (
            <span className={styles.opsValue}>
              <span className={styles.opsGuest}>{nextGap.nights}</span>
              <span className={styles.opsDate}>{formatGapRange(nextGap.start, nextGap.end)}</span>
            </span>
          ) : (
            <span className={styles.opsEmpty}>—</span>
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search guest or ref..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <div className={styles.statusDropdownWrapper} ref={statusDropdownRef}>
          <button
            className={`${styles.statusButton} ${statusDropdownOpen ? styles.statusButtonOpen : ''}`}
            onClick={() => setStatusDropdownOpen((o) => !o)}
          >
            <span className={styles.statusLabel}>Status</span>
            {filters.find((f) => f.key === activeFilter)?.label}
            <ChevronDown size={12} className={statusDropdownOpen ? styles.chevronOpen : ''} />
          </button>
          {statusDropdownOpen && (
            <div className={styles.dropdown}>
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`${styles.dropdownItem} ${activeFilter === f.key ? styles.dropdownItemActive : ''}`}
                  onClick={() => { setActiveFilter(f.key); setCurrentPage(1); setStatusDropdownOpen(false); }}
                >
                  {f.label}
                  {f.count !== undefined && <span className={styles.statusItemCount}>{f.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
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
            {paginated.map((booking) => (
              <tr key={booking.referenceCode} onClick={() => setSelectedBooking(booking)}>
                <td>
                  <span className={styles.refCode}>{booking.referenceCode}</span>
                </td>
                <td>
                  <div className={styles.guestInfo}>
                    <span className={styles.guestName}>{booking.guestName}</span>
                    <span className={styles.guestEmail}>{booking.guestEmail}</span>
                  </div>
                </td>
                <td>{formatDate(booking.checkIn)}</td>
                <td>{formatDate(booking.checkOut)}</td>
                <td className={styles.colNights}>{booking.nights}</td>
                <td className={`${styles.colTotal} ${styles.price}`}>
                  &euro;{booking.totalPrice.toLocaleString()}
                </td>
                <td>
                  <div
                    className={styles.paymentStatusWrapper}
                    ref={(el) => {
                      if (el) paymentDropdownRef.current[booking.referenceCode] = el;
                    }}
                  >
                    <button
                      className={styles.paymentBadge}
                      data-payment={booking.paymentStatus || 'Unpaid'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentDropdownOpen(
                          paymentDropdownOpen === booking.referenceCode ? null : booking.referenceCode,
                        );
                      }}
                    >
                      <span className={styles.paymentDot} />
                      {booking.paymentStatus || 'Unpaid'}
                    </button>
                    {paymentDropdownOpen === booking.referenceCode && (
                      <div className={styles.paymentDropdown}>
                        {['Unpaid', 'Deposit Paid', 'Paid'].map((status) => (
                          <button
                            key={status}
                            className={`${styles.paymentDropdownItem} ${booking.paymentStatus === status || (!booking.paymentStatus && status === 'Unpaid') ? styles.paymentDropdownItemActive : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentChange(booking.referenceCode, status as PaymentStatus);
                              setPaymentDropdownOpen(null);
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.status} data-status={booking.status}>
                    <span className={styles.statusDot} />
                    {STATUS_LABELS[booking.status]}
                  </span>
                </td>
                <td className={styles.colActions}>
                  <div className={styles.actions}>
                    {booking.status === 'pending' && (
                      <button
                        className={`${styles.actionIcon} ${styles.confirm}`}
                        onClick={(e) => handleTableConfirm(e, booking)}
                        disabled={hasConfirmedConflict(booking, bookings)}
                        title={
                          hasConfirmedConflict(booking, bookings)
                            ? 'Cannot confirm — dates overlap with a confirmed booking'
                            : 'Confirm booking'
                        }
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      className={styles.actionIcon}
                      onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
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

      {/* Mobile card layout */}
      <div className={styles.mobileCards}>
        {paginated.map((booking) => (
          <div
            key={booking.referenceCode}
            className={styles.card}
            onClick={() => setSelectedBooking(booking)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardGuest}>
                <div className={styles.cardGuestName}>{booking.guestName}</div>
                <div className={styles.cardRef}>{booking.referenceCode}</div>
              </div>
              <div className={styles.cardStatus}>
                <span className={styles.status} data-status={booking.status}>
                  <span className={styles.statusDot} />
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div>
                <div className={styles.cardDetailLabel}>Check-in</div>
                <div className={styles.cardDetailValue}>{formatDate(booking.checkIn)}</div>
              </div>
              <div>
                <div className={styles.cardDetailLabel}>Check-out</div>
                <div className={styles.cardDetailValue}>{formatDate(booking.checkOut)}</div>
              </div>
              <div>
                <div className={styles.cardDetailLabel}>Nights</div>
                <div className={styles.cardDetailValue}>{booking.nights}</div>
              </div>
              <div>
                <div className={styles.cardDetailLabel}>Total</div>
                <div className={styles.cardDetailValue}>
                  <strong>&euro;{booking.totalPrice.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div
                className={styles.paymentStatusWrapper}
                ref={(el) => {
                  if (el) paymentDropdownRef.current[booking.referenceCode] = el;
                }}
              >
                <button
                  className={styles.paymentBadge}
                  data-payment={booking.paymentStatus || 'Unpaid'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentDropdownOpen(
                      paymentDropdownOpen === booking.referenceCode ? null : booking.referenceCode,
                    );
                  }}
                >
                  <span className={styles.paymentDot} />
                  {booking.paymentStatus || 'Unpaid'}
                </button>
                {paymentDropdownOpen === booking.referenceCode && (
                  <div className={styles.paymentDropdown}>
                    {['Unpaid', 'Deposit Paid', 'Paid'].map((status) => (
                      <button
                        key={status}
                        className={`${styles.paymentDropdownItem} ${booking.paymentStatus === status || (!booking.paymentStatus && status === 'Unpaid') ? styles.paymentDropdownItemActive : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentChange(booking.referenceCode, status as PaymentStatus);
                          setPaymentDropdownOpen(null);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.actions}>
                {booking.status === 'pending' && (
                  <button
                    className={`${styles.actionIcon} ${styles.confirm}`}
                    onClick={(e) => handleTableConfirm(e, booking)}
                    disabled={hasConfirmedConflict(booking, bookings)}
                    title={
                      hasConfirmedConflict(booking, bookings)
                        ? 'Cannot confirm — dates overlap with a confirmed booking'
                        : 'Confirm booking'
                    }
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className={styles.actionIcon}
                  onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                  title="View booking"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {paginatedStart + 1}–{Math.min(paginatedStart + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationBtn}
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.paginationBtn} ${page === safeCurrentPage ? styles.paginationBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.paginationBtn}
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          allBookings={bookings}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onSaveNotes={handleSaveNotes}
          onPaymentChange={handlePaymentChange}
        />
      )}
    </div>
  );
}
