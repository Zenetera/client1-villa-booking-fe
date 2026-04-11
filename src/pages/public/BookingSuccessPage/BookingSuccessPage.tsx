import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import styles from './BookingSuccessPage.module.css';

export function BookingSuccessPage() {
  const [params] = useSearchParams();
  const reference = params.get('ref');

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <CheckCircle2 size={48} className={styles.icon} />
        <h1 className={styles.title}>Request received</h1>
        <p className={styles.subtitle}>
          Thank you — your booking request has been submitted. We'll review and confirm it shortly,
          and you'll receive an email once it's approved.
        </p>
        {reference && (
          <div className={styles.refBox}>
            <span className={styles.refLabel}>Reference</span>
            <code className={styles.refCode}>{reference}</code>
          </div>
        )}
        {reference ? (
          <p className={styles.note}>
            Please keep your reference for any follow-up. Note that your booking is not confirmed
            until we approve it.
          </p>
        ) : (
          <p className={styles.note}>
            Note that your booking is not confirmed until we approve it.
          </p>
        )}
        <Link to="/" className={styles.homeLink}>
          Back to villa
        </Link>
      </div>
    </section>
  );
}
