import { useLanguage } from '../../../context/LanguageContext';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  heroImageUrl?: string;
}

export function HeroSection({ heroImageUrl }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      {heroImageUrl && (
        <img src={heroImageUrl} alt="" className={styles.image} />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{t.hero.eyebrow}</p>
        <h1 className={styles.heading}>
          {t.hero.headingLine1}<br />
          <em>{t.hero.headingEm}</em>
        </h1>
        <p className={styles.subtitle}>{t.hero.subtitle}</p>
      </div>
      <div className={styles.bottomFade} />
    </section>
  );
}
