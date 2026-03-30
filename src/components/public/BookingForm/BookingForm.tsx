import { useState } from 'react';
import type { GuestInfo } from '../../../types/booking';
import { PriceBreakdown } from '../PriceBreakdown';
import { GuestInfoForm } from '../GuestInfoForm';
import styles from './BookingForm.module.css';

interface BookingFormProps {
  pricePerNight: number;
  currency?: string;
  maxGuests: number;
}

export function BookingForm({
  pricePerNight,
  currency = '$',
  maxGuests,
}: BookingFormProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className={styles.card} onSubmit={(e) => e.preventDefault()}>
      <h3 className={styles.title}>Book Your Stay</h3>

      <PriceBreakdown price={pricePerNight} currency={currency} />

      <div className={styles.dateRow}>
        <div className={styles.field}>
          <label className={styles.label}>Check-in</label>
          <input
            type="date"
            className={styles.input}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Check-out</label>
          <input
            type="date"
            className={styles.input}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.field} ${styles.guestsField}`}>
        <label className={styles.label}>Guests</label>
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
        Deposit is <strong>10%</strong> of the total booking amount to be paid in advance. The remaining balance will be due upon check-in.
      </div>

      <button type="submit" className={styles.submitButton}>
        Request Booking
      </button>
    </form>
  );
}
