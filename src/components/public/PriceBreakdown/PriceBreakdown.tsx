import { useLanguage } from '../../../context/LanguageContext';
import styles from './PriceBreakdown.module.css';

interface PriceBreakdownProps {
  price: number;
  currency?: string;
}

export function PriceBreakdown({ price, currency = '$' }: PriceBreakdownProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.wrapper}>
      <p className={styles.price}>
        {currency}{price}
        <span className={styles.unit}> / {t.price.night}</span>
      </p>
    </div>
  );
}
