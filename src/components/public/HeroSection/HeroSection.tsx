import heroImage from '../../../assets/hero.jpg';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <img src={heroImage} alt="" className={styles.image} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.eyebrow}>Curated Luxury Retreats</p>
        <h1 className={styles.heading}>
          Find Your Perfect<br />
          <em>Escape</em>
        </h1>
        <p className={styles.subtitle}>
          Handpicked villas in the world's most breathtaking destinations
        </p>
      </div>
      <div className={styles.bottomFade} />
    </section>
  );
}
