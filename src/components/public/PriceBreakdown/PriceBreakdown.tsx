import type { PricingQuote } from '../../../api/villa';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './PriceBreakdown.module.css';

interface PriceBreakdownProps {
  price: number;
  quote?: PricingQuote | null;
  loading?: boolean;
  error?: boolean;
}

export function PriceBreakdown({
  price,
  quote,
  loading,
  error,
}: PriceBreakdownProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loadingText}>{t.price.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.errorText}>{t.price.error}</p>
      </div>
    );
  }

  // No quote yet — show base price
  if (!quote) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.price}>
          {t.price.from} €{price}
          <span className={styles.unit}> / {t.price.night}</span>
        </p>
      </div>
    );
  }

  // Group consecutive nights by price+ruleName
  const groups: { ruleName: string | null; price: string; count: number }[] = [];
  for (const night of quote.nights) {
    const last = groups[groups.length - 1];
    if (last && last.price === night.price && last.ruleName === night.ruleName) {
      last.count++;
    } else {
      groups.push({ ruleName: night.ruleName, price: night.price, count: 1 });
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.nightsList}>
        {groups.map((g, i) => (
          <div key={i} className={styles.nightRow}>
            <span className={styles.nightLabel}>
              €{g.price} x {g.count} {g.count === 1 ? t.price.night : t.price.nights}
              {g.ruleName && (
                <span className={styles.ruleBadge}>{g.ruleName}</span>
              )}
            </span>
            <span className={styles.nightAmount}>
              €{(parseFloat(g.price) * g.count).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr className={styles.divider} />

      <div className={styles.summaryRow}>
        <span>{t.price.accommodation}</span>
        <span>€{quote.accommodationTotal}</span>
      </div>
      <div className={styles.summaryRow}>
        <span>{t.price.touristTax}</span>
        <span>€{quote.touristTaxTotal}</span>
      </div>

      <hr className={styles.divider} />

      <div className={`${styles.summaryRow} ${styles.totalRow}`}>
        <span>{t.price.total}</span>
        <span>€{quote.totalPrice}</span>
      </div>
    </div>
  );
}
