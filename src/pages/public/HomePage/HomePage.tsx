import { useEffect, useState } from 'react';
import { fetchVilla } from '../../../api/villa';
import type { Villa } from '../../../types/villa';
import { HeroSection } from '../../../components/public/HeroSection';
import { SectionIntro } from '../../../components/public/SectionIntro';
import { VillaDetails } from '../../../components/public/VillaDetails';
import { ImageGallery } from '../../../components/public/ImageGallery';
import { LocationMap } from '../../../components/public/LocationMap';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HomePage.module.css';

export function HomePage() {
  const { lang, t } = useLanguage();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVilla(lang)
      .then((data) => {
        if (!cancelled) {
          setError(false);
          setVilla(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [lang]);

  return (
    <>
      <HeroSection />
      <SectionIntro eyebrow={t.home.retreatEyebrow} heading={t.home.retreatHeading} />
      {error ? (
        <p className={styles.errorText}>Unable to load villa details.</p>
      ) : villa ? (
        <VillaDetails villa={villa} />
      ) : (
        <p className={styles.loadingText}>Loading...</p>
      )}
      <div className={styles.gallerySection}>
        <SectionIntro eyebrow={t.home.galleryEyebrow} heading={t.home.galleryHeading} />
        <ImageGallery />
      </div>
      <SectionIntro eyebrow={t.home.locationEyebrow} heading={t.home.locationHeading} />
      <LocationMap />
    </>
  );
}
