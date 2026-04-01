import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Ban, X } from 'lucide-react';
import { MOCK_BOOKINGS } from '../../../mocks/data';
import type { Booking } from '../../../types/booking';
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
  onApply: (dates: Set<string>) => void;
}

function BlockModal({ initialYear, initialMonth, existingBlocked, onClose, onApply }: BlockModalProps) {
  const [mYear, setMYear] = useState(initialYear);
  const [mMonth, setMMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(new Set<string>());

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

  function toggle(ds: string) {
    if (existingBlocked.has(ds)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ds)) next.delete(ds); else next.add(ds);
      return next;
    });
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Block Dates</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>
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
            const isPicked = selected.has(ds);
            return (
              <button
                key={day}
                type="button"
                disabled={alreadyBlocked}
                onClick={() => toggle(ds)}
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

        <div className={styles.modalFooter}>
          <span className={styles.modalCount}>
            {selected.size} date{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancel} onClick={onClose}>Cancel</button>
            <button
              type="button"
              className={styles.modalApply}
              disabled={selected.size === 0}
              onClick={() => onApply(selected)}
            >
              Block {selected.size > 0 ? selected.size : ''} Date{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BlockedDatesPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5); // June
  const [blockedDates, setBlockedDates] = useState(
    new Set<string>(['2026-06-25', '2026-06-26', '2026-06-27']),
  );
  const [showModal, setShowModal] = useState(false);
  const [blockedScope, setBlockedScope] = useState<'month' | 'year'>('year');
  const monthsRowRef = useRef<HTMLDivElement>(null);

  const bookings = MOCK_BOOKINGS;

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
  const blockedFiltered = Array.from(blockedDates)
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

  function handleApplyBlock(dates: Set<string>) {
    setBlockedDates(prev => {
      const next = new Set(prev);
      dates.forEach(d => next.add(d));
      return next;
    });
    setShowModal(false);
  }

  function unblock(ds: string) {
    setBlockedDates(prev => {
      const next = new Set(prev);
      next.delete(ds);
      return next;
    });
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
              blocked={blockedDates}
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
              const status = getDayStatus(ds, bookings, blockedDates);
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
                  <div key={b.referenceCode} className={styles.bookingRow}>
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
          existingBlocked={blockedDates}
          onClose={() => setShowModal(false)}
          onApply={handleApplyBlock}
        />
      )}
    </div>
  );
}
