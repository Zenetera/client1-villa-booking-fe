import styles from './LangTabs.module.css';

type EditLang = 'en' | 'el';

interface LangTabsProps {
  value: EditLang;
  onChange: (lang: EditLang) => void;
}

export function LangTabs({ value, onChange }: LangTabsProps) {
  return (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${value === 'en' ? styles.tabActive : ''}`}
        onClick={() => onChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`${styles.tab} ${value === 'el' ? styles.tabActive : ''}`}
        onClick={() => onChange('el')}
      >
        EL
      </button>
    </div>
  );
}
