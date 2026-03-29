import styles from './PriceBreakdown.module.css';

interface PriceBreakdownProps {
  price: number;
  currency?: string;
  unit?: string;
}

export function PriceBreakdown({
  price,
  currency = '$',
  unit = 'night',
}: PriceBreakdownProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.price}>
        {currency}{price}
        <span className={styles.unit}> / {unit}</span>
      </p>
    </div>
  );
}
