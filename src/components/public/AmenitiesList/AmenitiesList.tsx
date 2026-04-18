import { Check } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import styles from './AmenitiesList.module.css';

interface AmenitiesListProps {
  amenities: string[];
}

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>{t.amenities.heading}</h3>
      <div className={styles.grid}>
        {amenities.map((amenity) => (
          <div key={amenity} className={styles.item}>
            <Check size={16} className={styles.icon} />
            <span>{t.amenities.items[amenity] ?? amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
