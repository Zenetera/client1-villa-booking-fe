import { useLanguage } from '../../../hooks/useLanguage';
import { cloudinaryUrl, cloudinarySrcSet } from '../../../utils/cloudinaryImage';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  heroImageUrl?: string;
  heroImageAlt?: string;
}

const HERO_WIDTHS = [640, 960, 1280, 1600, 1920];

export function HeroSection({ heroImageUrl, heroImageAlt }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      {heroImageUrl && (
        <img
          src={cloudinaryUrl(heroImageUrl, { width: 1280 })}
          srcSet={cloudinarySrcSet(heroImageUrl, HERO_WIDTHS)}
          sizes="100vw"
          alt={heroImageAlt ?? ''}
          className={styles.image}
          fetchPriority="high"
          decoding="async"
        />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.heading}>
          {t.hero.headingLine1}<br />
          <em>{t.hero.headingEm}</em>
        </h1>
      </div>
      <div className={styles.bottomFade} />
    </section>
  );
}
