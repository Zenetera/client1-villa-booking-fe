import styles from './SectionIntro.module.css';

interface SectionIntroProps {
  eyebrow: string;
  heading: string;
}

export function SectionIntro({ eyebrow, heading }: SectionIntroProps) {
  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.heading}>{heading}</h2>
    </section>
  );
}
