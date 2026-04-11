import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Ban, X } from 'lucide-react';
import type { Booking } from '../../../types/booking';
import { listBookings } from '../../../api/booking';
import {
  createBlockedDates,
  deleteBlockedDate,
  listBlockedDates,
  type BlockedDate,
} from '../../../api/blockedDate';
import styles from './BlockedDatesPage.module.css';

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type DayStatus = 'confirmed' | 'pending' | 'overlap' | 'blocked' | 'available';

// ── Helpers ──────────────────────────────────────────────────────────────────

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function monthOffset(y: number, m: number) {
  const dow = new Date(y, m, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function getDayStatus(dateStr: string, bookings: Booking[], blocked: Set<string>): DayStatus {
  if (blocked.has(dateStr)) return 'blocked';
  const active = bookings.filter(
    b =>
      b.checkIn <= dateStr &&
      b.checkOut > dateStr &&
      b.status !== 'cancelled' &&
      b.status !== 'completed',
  );
  if (active.length === 0) return 'available';
  const pendingCount = active.filter(b => b.status === 'pending').length;
  if (pendingCount >= 2) return 'overlap';
  if (active.some(b => b.status === 'confirmed')) return 'confirmed';
  return 'pending';
}

function getFirstBookingAtDate(dateStr: string, bookings: Booking[]) {
  return bookings.find(
    b =>
      b.checkIn <= dateStr &&
      b.checkOut > dateStr &&
      b.status !== 'cancelled' &&
      b.status !== 'completed',
  );
}

function formatRange(b: Booking) {
  const ci = new Date(b.checkIn + 'T12:00:00');
  const co = new Date(b.checkOut + 'T12:00:00');
  const inM = MONTH_SHORT[ci.getMonth()];
  const outM = MONTH_SHORT[co.getMonth()];
  return inM === outM
    ? `${inM} ${ci.getDate()}–${co.getDate()}`
    : `${inM} ${ci.getDate()}–${outM} ${co.getDate()}`;
}

function formatDateShort(ds: string) {
  const [, m, d] = ds.split('-');
  return `${MONTH_SHORT[parseInt(m) - 1]} ${parseInt(d)}`;
}

// ── Mini Month (year strip) ───────────────────────────────────────────────────

interface MiniMonthProps {
  year: number;
  month: number;
  isActive: boolean;
  bookings: Booking[];
  blocked: Set<string>;
  onClick: () => void;
}

function MiniMonth({ year, month, isActive, bookings, blocked, onClick }: MiniMonthProps) {
  const offset = monthOffset(year, month);
  const total = daysInMonth(year, month);

  return (
    <button
      type="button"
      className={`${styles.miniMonth} ${isActive ? styles.miniActive : ''}`}
      onClick={onClick}
    >
      <span className={styles.miniLabel}>{MONTH_SHORT[month]}</span>
      <div className={styles.miniGrid}>
        {Array.from({ length: offset }, (_, i) => (
          <div key={`g${i}`} className={styles.miniEmpty} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const ds = toDateStr(year, month, i + 1);
          const status = getDayStatus(ds, bookings, blocked);
          return <div key={i} className={`${styles.miniCell} ${styles[`mini_${status}`]}`} />;
        })}
      </div>
    </button>
  );
}

// ── Block Dates Modal ─────────────────────────────────────────────────────────

interface BlockModalProps {
  initialYear: number;
  initialMonth: number;
  existingBlocked: Set<string>;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => Promise<void>;
}

function countRange(start: string, end: string): number {
  const s = new Date(start + 'T12:00:00').getTime();
  const e = new Date(end + 'T12:00:00').getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function rangeHasBlocked(start: string, end: string, blocked: Set<string>): boolean {
  const lo = start <= end ? start : end;
  const hi = start <= end ? end : start;
  const d = new Date(lo + 'T12:00:00');
  const last = new Date(hi + 'T12:00:00');
  while (d <= last) {
    const ds = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    if (blocked.has(ds)) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

function BlockModal({ initialYear, initialMonth, existingBlocked, onClose, onApply }: BlockModalProps) {
  const [mYear, setMYear] = useState(initialYear);
  const [mMonth, setMMonth] = useState(initialMonth);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = daysInMonth(mYear, mMonth);
  const offset = monthOffset(mYear, mMonth);

  function prevM() {
    if (mMonth === 0) { setMYear(y => y - 1); setMMonth(11); }
    else setMMonth(m => m - 1);
  }
  function nextM() {
    if (mMonth === 11) { setMYear(y => y + 1); setMMonth(0); }
    else setMMonth(m => m + 1);
  }

  function pickDay(ds: string) {
    if (existingBlocked.has(ds)) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(ds);
      setRangeEnd(null);
      setError(null);
      return;
    }
    if (rangeHasBlocked(rangeStart, ds, existingBlocked)) {
      setError('Selection cannot span an already-blocked date. Pick a different endpoint.');
      return;
    }
    if (ds < rangeStart) {
      setRangeStart(ds);
      setError(null);
      return;
    }
    setRangeEnd(ds);
    setError(null);
  }

  function isInRange(ds: string): boolean {
    if (!rangeStart) return false;
    if (!rangeEnd) return ds === rangeStart;
    return ds >= rangeStart && ds <= rangeEnd;
  }

  async function handleApply() {
    if (!rangeStart) return;
    const end = rangeEnd ?? rangeStart;
    if (rangeHasBlocked(rangeStart, end, existingBlocked)) {
      setError('Selection cannot span an already-blocked date.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onApply(rangeStart, end);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to block dates');
      setSubmitting(false);
    }
  }

  const count = rangeStart ? countRange(rangeStart, rangeEnd ?? rangeStart) : 0;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Block Dates</h3>
          <button type="button" className={styles.modalClose} onClick={onClose} disabled={submitting}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalNav}>
          <button type="button" className={styles.navButton} onClick={prevM}>
            <ChevronLeft size={16} />
          </button>
          <span className={styles.modalMonthLabel}>
            {MONTH_NAMES[mMonth]} {mYear}
          </span>
          <button type="button" className={styles.navButton} onClick={nextM}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.modalGrid}>
          {WEEK_DAYS.map(d => (
            <div key={d} className={styles.modalDayHeader}>{d}</div>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`g${i}`} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const day = i + 1;
            const ds = toDateStr(mYear, mMonth, day);
            const alreadyBlocked = existingBlocked.has(ds);
            const isPicked = isInRange(ds);
            return (
              <button
                key={day}
                type="button"
                disabled={alreadyBlocked || submitting}
                onClick={() => pickDay(ds)}
                className={`${styles.modalDayCell}
                  ${alreadyBlocked ? styles.modalDayExisting : ''}
                  ${isPicked ? styles.modalDayPicked : ''}
                `}
              >
                <span className={alreadyBlocked ? styles.modalDayStrike : ''}>{day}</span>
              </button>
            );
          })}
        </div>

        {error && <p className={styles.modalError}>{error}</p>}

        <div className={styles.modalFooter}>
          <span className={styles.modalCount}>
            {rangeStart
              ? rangeEnd
                ? `${formatDateShort(rangeStart)} → ${formatDateShort(rangeEnd)} · ${count} night${count !== 1 ? 's' : ''}`
                : `${formatDateShort(rangeStart)} — pick end date`
              : 'Pick a start date'}
          </span>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancel} onClick={onClose} disabled={submitting}>Cancel</button>
            <button
              type="button"
              className={styles.modalApply}
              disabled={!rangeStart || submitting}
              onClick={handleApply}
            >
              {submitting ? 'Blocking…' : `Block ${count > 0 ? count : ''} Date${count !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BlockedDatesPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [blockedScope, setBlockedScope] = useState<'month' | 'year'>('year');
  const monthsRowRef = useRef<HTMLDivElement>(null);

  // Manual blocked dates only — booking-generated dates are colored from bookings.
  const manualBlocked = blockedList.filter((b) => b.bookingId === null);
  const blockedSet = new Set(manualBlocked.map((b) => b.date));
  const blockedIdByDate = new Map(manualBlocked.map((b) => [b.date, b.id]));

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const fetchAllBookings = async (): Promise<Booking[]> => {
        const pageSize = 500;
        const first = await listBookings({ status: 'all', limit: pageSize, page: 1 });
        const all: Booking[] = [...first.bookings];
        for (let p = 2; p <= first.pagination.totalPages; p += 1) {
          const res = await listBookings({ status: 'all', limit: pageSize, page: p });
          all.push(...res.bookings);
        }
        return all;
      };

      const [allBookings, blockedRes] = await Promise.all([
        fetchAllBookings(),
        listBlockedDates('manual'),
      ]);
      setBookings(allBookings);
      setBlockedList(blockedRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Scroll active mini-month into view on mobile
  useEffect(() => {
    const row = monthsRowRef.current;
    if (!row) return;
    const active = row.querySelector(`.${styles.miniActive}`) as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [month]);

  const total = daysInMonth(year, month);
  const offset = monthOffset(year, month);
  const firstDay = toDateStr(year, month, 1);
  const lastDay = toDateStr(year, month, total);

  const visibleBookings = bookings
    .filter(
      b =>
        b.checkIn <= lastDay &&
        b.checkOut > firstDay &&
        b.status !== 'cancelled' &&
        b.status !== 'completed',
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  // Blocked dates list (for side panel)
  const monthPrefix = `${year}-${pad2(month + 1)}-`;
  const yearPrefix = `${year}-`;
  const blockedFiltered = manualBlocked
    .map((b) => b.date)
    .filter(d => d.startsWith(blockedScope === 'month' ? monthPrefix : yearPrefix))
    .sort();

  // Group by month for year view
  const blockedGrouped = blockedFiltered.reduce<Record<string, string[]>>((acc, d) => {
    const key = d.slice(0, 7); // "YYYY-MM"
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  async function handleApplyBlock(startDate: string, endDate: string) {
    await createBlockedDates(startDate, endDate);
    setShowModal(false);
    await loadAll();
  }

  async function unblock(ds: string) {
    const id = blockedIdByDate.get(ds);
    if (id === undefined) return;
    try {
      await deleteBlockedDate(id);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unblock');
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>View bookings and manage blocked dates</p>
        </div>
        <button className={styles.blockButton} onClick={() => setShowModal(true)}>
          <Ban size={16} />
          Block Dates
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Year strip */}
      <div className={styles.yearStrip}>
        <button type="button" className={styles.yearNav} onClick={() => setYear(y => y - 1)}>
          <ChevronLeft size={15} />
        </button>
        <span className={styles.yearLabel}>{year}</span>
        <div className={styles.monthsRow} ref={monthsRowRef}>
          {MONTH_SHORT.map((_, i) => (
            <MiniMonth
              key={i}
              year={year}
              month={i}
              isActive={i === month}
              bookings={bookings}
              blocked={blockedSet}
              onClick={() => setMonth(i)}
            />
          ))}
        </div>
        <button type="button" className={styles.yearNav} onClick={() => setYear(y => y + 1)}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Main layout: calendar + side panels */}
      <div className={styles.mainLayout}>

        {/* Calendar */}
        <div className={styles.card}>
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.navButton} onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <h2 className={styles.monthTitle}>{MONTH_NAMES[month]} {year}</h2>
            <button type="button" className={styles.navButton} onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendConfirmed}`} />
              Confirmed
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendPending}`} />
              Pending
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendOverlap}`} />
              Overlapping
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendBlocked}`} />
              Blocked
            </span>
          </div>

          <div className={styles.calendarGrid}>
            {WEEK_DAYS.map(d => (
              <div key={d} className={styles.dayHeader}>{d}</div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`g${i}`} className={styles.emptyCell} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const day = i + 1;
              const ds = toDateStr(year, month, day);
              const status = getDayStatus(ds, bookings, blockedSet);
              const bk = getFirstBookingAtDate(ds, bookings);
              const showLabel = bk?.checkIn === ds && status !== 'overlap';
              return (
                <div key={day} className={`${styles.dayCell} ${styles[status]}`}>
                  <span className={styles.dayNumber}>{day}</span>
                  {status === 'overlap' && (
                    <span className={styles.overlapBadge}>!</span>
                  )}
                  {showLabel && bk && (
                    <span className={styles.dayLabel}>{bk.guestName.split(' ')[0]}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panels */}
        <div className={styles.sideSection}>

          {/* Bookings this month */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>
              Bookings — {MONTH_SHORT[month]} {year}
            </h3>
            {visibleBookings.length === 0 ? (
              <p className={styles.emptyNote}>No bookings this month.</p>
            ) : (
              <div className={styles.sideList}>
                {visibleBookings.map(b => (
                  <div key={b.id} className={styles.bookingRow}>
                    <span className={`${styles.bookingDot} ${styles[`dot_${b.status}`]}`} />
                    <div className={styles.bookingInfo}>
                      <span className={styles.bookingName}>{b.guestName}</span>
                      <span className={styles.bookingMeta}>{b.referenceCode} · {formatRange(b)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked dates */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeaderRow}>
              <h3 className={styles.sideCardTitle}>Blocked Dates</h3>
              <select
                className={styles.scopeSelect}
                value={blockedScope}
                onChange={e => setBlockedScope(e.target.value as 'month' | 'year')}
              >
                <option value="year">This year</option>
                <option value="month">This month</option>
              </select>
            </div>

            {blockedFiltered.length === 0 ? (
              <p className={styles.emptyNote}>No blocked dates.</p>
            ) : blockedScope === 'month' ? (
              <div className={styles.sideList}>
                {blockedFiltered.map(ds => (
                  <div key={ds} className={styles.blockedRow}>
                    <span className={styles.blockedDate}>{formatDateShort(ds)}</span>
                    <button
                      type="button"
                      className={styles.unblockBtn}
                      onClick={() => unblock(ds)}
                      title="Remove block"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.sideList}>
                {Object.entries(blockedGrouped).map(([key, dates]) => {
                  const [y, m] = key.split('-');
                  const monthName = MONTH_SHORT[parseInt(m) - 1] + ' ' + y;
                  return (
                    <div key={key} className={styles.blockedGroup}>
                      <span className={styles.blockedGroupLabel}>{monthName}</span>
                      {dates.map(ds => (
                        <div key={ds} className={styles.blockedRow}>
                          <span className={styles.blockedDate}>{formatDateShort(ds)}</span>
                          <button
                            type="button"
                            className={styles.unblockBtn}
                            onClick={() => unblock(ds)}
                            title="Remove block"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Block Dates Modal */}
      {showModal && (
        <BlockModal
          initialYear={year}
          initialMonth={month}
          existingBlocked={blockedSet}
          onClose={() => setShowModal(false)}
          onApply={handleApplyBlock}
        />
      )}
    </div>
  );
}
