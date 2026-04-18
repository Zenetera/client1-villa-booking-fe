import { useEffect, useState } from 'react';
import { fetchVilla } from '../../../api/villa';
import type { Villa } from '../../../types/villa';
import { HeroSection } from '../../../components/public/HeroSection';
import { SectionIntro } from '../../../components/public/SectionIntro';
import { VillaDetails } from '../../../components/public/VillaDetails';
import { ImageGallery } from '../../../components/public/ImageGallery';
import { LocationMap } from '../../../components/public/LocationMap';
import { useLanguage } from '../../../hooks/useLanguage';
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
        if (!cancelled) {
          setError(true);
          setVilla(null);
        }
      });
    return () => { cancelled = true; };
  }, [lang]);

  const heroImage = villa?.images.find((img) => img.isHero);

  return (
    <>
      <HeroSection heroImageUrl={heroImage?.url} heroImageAlt={heroImage?.alt} />
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
        <ImageGallery images={villa?.images ?? []} />
      </div>
      <SectionIntro eyebrow={t.home.locationEyebrow} heading={t.home.locationHeading} />
      <LocationMap />
    </>
  );
}
