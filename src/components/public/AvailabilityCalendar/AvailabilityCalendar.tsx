import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAvailability, type AvailabilityDay } from '../../../api/blockedDate';
import styles from './AvailabilityCalendar.module.css';

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface AvailabilityCalendarProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

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

function todayStr() {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

export function AvailabilityCalendar({ checkIn, checkOut, onChange }: AvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState<Map<string, AvailabilityDay>>(new Map());
  const [loading, setLoading] = useState(false);

  const total = daysInMonth(year, month);
  const offset = monthOffset(year, month);

  const rangeFrom = toDateStr(year, month, 1);
  const rangeTo = toDateStr(year, month, total);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      
      try {
        const res = await fetchAvailability(rangeFrom, rangeTo);
        if (cancelled) return;
        const map = new Map<string, AvailabilityDay>();
        res.dates.forEach((d) => map.set(d.date, d));
        setAvailability(map);
      } catch {
        if (!cancelled) setAvailability(new Map());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [rangeFrom, rangeTo]);

  const minDate = todayStr();

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function rangeHasBlocked(start: string, end: string): boolean {
    // Check every night from start (inclusive) to end (exclusive)
    const startD = new Date(start + 'T12:00:00');
    const endD = new Date(end + 'T12:00:00');
    const cur = new Date(startD);
    while (cur < endD) {
      const ds = toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate());
      const day = availability.get(ds);
      if (day && !day.available) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  function pickDay(ds: string) {
    if (ds < minDate) return;
    const day = availability.get(ds);
    // For check-in: day must be available
    // For check-out: the check-out day itself can be blocked since it's not a stayed night
    if (!checkIn || (checkIn && checkOut)) {
      if (day && !day.available) return;
      onChange(ds, '');
      return;
    }
    if (ds <= checkIn) {
      if (day && !day.available) return;
      onChange(ds, '');
      return;
    }
    // ds > checkIn — set as checkout
    if (rangeHasBlocked(checkIn, ds)) {
      // Reset to ds as new check-in if available
      if (day && !day.available) {
        onChange('', '');
        return;
      }
      onChange(ds, '');
      return;
    }
    onChange(checkIn, ds);
  }

  const cells = useMemo(() => {
    const arr: Array<{ day: number; ds: string } | null> = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let i = 1; i <= total; i++) {
      arr.push({ day: i, ds: toDateStr(year, month, i) });
    }
    return arr;
  }, [offset, total, year, month]);

  function dayClass(ds: string): string {
    const day = availability.get(ds);
    const blocked = (day && !day.available) || ds < minDate;
    const isCheckIn = checkIn === ds;
    const isCheckOut = checkOut === ds;
    const inRange = checkIn && checkOut && ds > checkIn && ds < checkOut;
    return [
      styles.dayCell,
      blocked ? styles.blocked : '',
      isCheckIn ? styles.checkIn : '',
      isCheckOut ? styles.checkOut : '',
      inRange ? styles.inRange : '',
    ].filter(Boolean).join(' ');
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.navButton} onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button type="button" className={styles.navButton} onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEK_DAYS.map((d) => (
          <div key={d} className={styles.weekDay}>{d}</div>
        ))}
        {cells.map((cell, i) =>
          cell === null ? (
            <div key={`g${i}`} />
          ) : (
            <button
              key={cell.ds}
              type="button"
              className={dayClass(cell.ds)}
              onClick={() => pickDay(cell.ds)}
              disabled={loading}
            >
              <span className={styles.dayNum}>{cell.day}</span>
              {availability.get(cell.ds)?.price && (
                <span className={styles.dayPrice}>
                  €{Math.round(parseFloat(availability.get(cell.ds)!.price!))}
                </span>
              )}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
