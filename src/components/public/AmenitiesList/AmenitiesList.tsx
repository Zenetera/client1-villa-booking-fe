import { Check } from 'lucide-react';
import styles from './AmenitiesList.module.css';

interface AmenitiesListProps {
  amenities: string[];
}

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>Amenities</h3>
      <div className={styles.grid}>
        {amenities.map((amenity) => (
          <div key={amenity} className={styles.item}>
            <Check size={16} className={styles.icon} />
            <span>{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
