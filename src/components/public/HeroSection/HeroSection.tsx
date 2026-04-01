import heroImage from '../../../assets/hero.png';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <img src={heroImage} alt="" className={styles.image} />
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
