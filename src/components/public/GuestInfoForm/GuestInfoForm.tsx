import type { GuestInfo } from '../../../types/booking';
import styles from './GuestInfoForm.module.css';

interface GuestInfoFormProps extends GuestInfo {
  onChange: (field: keyof GuestInfo, value: string) => void;
}

export function GuestInfoForm({
  fullName,
  email,
  phone,
  specialRequests,
  onChange,
}: GuestInfoFormProps) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.field}>
        <label className={styles.label}>Full Name</label>
        <input
          type="text"
          className={styles.input}
          value={fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Phone</label>
        <input
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Special Requests</label>
        <textarea
          className={styles.textarea}
          value={specialRequests}
          onChange={(e) => onChange('specialRequests', e.target.value)}
        />
      </div>
    </div>
  );
}
