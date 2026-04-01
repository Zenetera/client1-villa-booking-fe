import { MapPin, BedDouble, Bath, Users } from 'lucide-react';
import type { Villa } from '../../../types/villa';
import { AmenitiesList } from '../AmenitiesList';
import { BookingForm } from '../BookingForm';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './VillaDetails.module.css';

interface VillaDetailsProps {
  villa: Villa;
}

export function VillaDetails({ villa }: VillaDetailsProps) {
  const { t } = useLanguage();
  const { name, location, bedrooms, bathrooms, maxGuests, amenities, pricePerNight, currency } = villa;

  return (
    <section id='booking' className={styles.section}>
      {/* Left column – villa info */}
      <div className={styles.info}>
        <p className={styles.location}>
          <MapPin size={14} className={styles.locationIcon} />
          {location}
        </p>
        <h2 className={styles.villaName}>{name}</h2>
        <p className={styles.tagline}>{t.villa.tagline}</p>

        <hr className={styles.divider} />

        <div className={styles.specs}>
          <div className={styles.spec}>
            <BedDouble size={18} className={styles.specIcon} />
            {bedrooms} {t.villa.bedrooms}
          </div>
          <div className={styles.spec}>
            <Bath size={18} className={styles.specIcon} />
            {bathrooms} {t.villa.bathrooms}
          </div>
          <div className={styles.spec}>
            <Users size={18} className={styles.specIcon} />
            {t.villa.upTo} {maxGuests} {t.villa.guests}
          </div>
        </div>
        <hr className={styles.divider} />
        <h3 className={styles.aboutHeading}>{t.villa.aboutHeading}</h3>
        {t.villa.description.map((paragraph, index) => (
          <p key={index} className={styles.aboutText}>
            {paragraph}
          </p>
        ))}

        <AmenitiesList amenities={amenities} />
      </div>

      {/* Right column – booking card */}
      <BookingForm
        pricePerNight={pricePerNight}
        currency={currency}
        maxGuests={maxGuests}
      />
    </section>
  );
}
