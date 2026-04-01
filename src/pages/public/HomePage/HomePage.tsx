import { MOCK_VILLA } from '../../../mocks/villa';
import { HeroSection } from '../../../components/public/HeroSection';
import { SectionIntro } from '../../../components/public/SectionIntro';
import { VillaDetails } from '../../../components/public/VillaDetails';
import { ImageGallery } from '../../../components/public/ImageGallery';
import { LocationMap } from '../../../components/public/LocationMap';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <HeroSection />
      <SectionIntro eyebrow={t.home.retreatEyebrow} heading={t.home.retreatHeading} />
      <VillaDetails villa={MOCK_VILLA} />
      <div className={styles.gallerySection}>
        <SectionIntro eyebrow={t.home.galleryEyebrow} heading={t.home.galleryHeading} />
        <ImageGallery />
      </div>
      <SectionIntro eyebrow={t.home.locationEyebrow} heading={t.home.locationHeading} />
      <LocationMap />
    </>
  );
}
