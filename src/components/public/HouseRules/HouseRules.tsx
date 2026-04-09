import { useLanguage } from '../../../context/LanguageContext';
import styles from './HouseRules.module.css';

interface HouseRulesProps {
  rules: string;
}

export function HouseRules({ rules }: HouseRulesProps) {
  const { t } = useLanguage();

  const lines = rules.split('\n').filter(Boolean);

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>{t.villa.houseRulesHeading}</h3>
      <ul className={styles.list}>
        {lines.map((line, i) => (
          <li key={i} className={styles.item}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
