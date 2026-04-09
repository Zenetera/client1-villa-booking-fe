import { useState, useEffect } from 'react';
import type { GuestInfo } from '../../../types/booking';
import type { PricingQuote } from '../../../api/villa';
import { fetchPricingQuote } from '../../../api/villa';
import { PriceBreakdown } from '../PriceBreakdown';
import { GuestInfoForm } from '../GuestInfoForm';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './BookingForm.module.css';

interface BookingFormProps {
  pricePerNight: number;
  maxGuests: number;
}

export function BookingForm({
  pricePerNight,
  maxGuests,
}: BookingFormProps) {
  const { t } = useLanguage();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fetchResult, setFetchResult] = useState<{
    key: string;
    quote: PricingQuote | null;
    error: boolean;
  } | null>(null);

  const hasValidDates = !!checkIn && !!checkOut && checkOut > checkIn;
  const dateKey = hasValidDates ? `${checkIn}_${checkOut}` : '';
  const pricingQuote = fetchResult?.key === dateKey ? fetchResult.quote : null;
  const pricingError = fetchResult?.key === dateKey ? !!fetchResult.error : false;
  const pricingLoading = hasValidDates && fetchResult?.key !== dateKey;

  useEffect(() => {
    if (!hasValidDates) return;

    let cancelled = false;

    fetchPricingQuote(checkIn, checkOut)
      .then((quote) => {
        if (!cancelled) setFetchResult({ key: dateKey, quote, error: false });
      })
      .catch(() => {
        if (!cancelled) setFetchResult({ key: dateKey, quote: null, error: true });
      });

    return () => { cancelled = true; };
  }, [checkIn, checkOut, hasValidDates, dateKey]);

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className={styles.card} onSubmit={(e) => e.preventDefault()}>
      <h3 className={styles.title}>{t.booking.title}</h3>

      <PriceBreakdown
        price={pricePerNight}
        quote={pricingQuote}
        loading={pricingLoading}
        error={pricingError}
      />

      <div className={styles.dateRow}>
        <div className={styles.field}>
          <label className={styles.label}>{t.booking.checkIn}</label>
          <input
            type="date"
            className={styles.input}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.booking.checkOut}</label>
          <input
            type="date"
            className={styles.input}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.field} ${styles.guestsField}`}>
        <label className={styles.label}>{t.booking.guests}</label>
        <input
          type="number"
          className={styles.input}
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </div>

      <hr className={styles.divider} />

      <GuestInfoForm
        fullName={guestInfo.fullName}
        email={guestInfo.email}
        phone={guestInfo.phone}
        specialRequests={guestInfo.specialRequests}
        onChange={handleGuestInfoChange}
      />

      <div className={styles.depositInfo}>
        {t.booking.depositInfo}
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>
            {t.booking.termsPrefix}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
              {t.booking.termsLink}
            </a>
            {t.booking.termsSep1}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
              {t.booking.privacyLink}
            </a>
            {t.booking.termsSep2}
            <a href="#" className={styles.termsLink}>
              {t.booking.cancellationLink}
            </a>
          </span>
        </label>
      </div>

      <button type="submit" className={styles.submitButton} disabled={!termsAccepted}>
        {t.booking.submit}
      </button>
    </form>
  );
}
