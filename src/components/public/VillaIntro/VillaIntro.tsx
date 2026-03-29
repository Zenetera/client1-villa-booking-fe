import styles from './VillaIntro.module.css';

interface VillaIntroProps {
  eyebrow: string;
  heading: string;
}

export function VillaIntro({ eyebrow, heading }: VillaIntroProps) {
  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.heading}>{heading}</h2>
    </section>
  );
}
