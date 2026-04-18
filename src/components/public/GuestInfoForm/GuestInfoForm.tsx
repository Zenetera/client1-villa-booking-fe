import type { GuestInfo } from '../../../types/booking';
import { useLanguage } from '../../../hooks/useLanguage';
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
  const { t } = useLanguage();

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.field}>
        <label className={styles.label}>{t.guestInfo.fullName}</label>
        <input
          type="text"
          className={styles.input}
          value={fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.guestInfo.email}</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.guestInfo.phone}</label>
        <input
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.guestInfo.specialRequests}</label>
        <textarea
          className={styles.textarea}
          value={specialRequests}
          onChange={(e) => onChange('specialRequests', e.target.value)}
        />
      </div>
    </div>
  );
}
