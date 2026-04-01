import { useState } from 'react';
import { LangTabs } from '../../../components/admin/LangTabs';
import styles from './ContactInfoPage.module.css';

type EditLang = 'en' | 'el';

interface ContactText {
  displayName: string;
  street: string;
  city: string;
  region: string;
  country: string;
}

const DEFAULTS: Record<EditLang, ContactText> = {
  en: {
    displayName: 'Marco',
    street: 'Via Cristoforo Colombo, 15',
    city: 'Positano',
    region: 'Salerno (SA)',
    country: 'Italy',
  },
  el: {
    displayName: 'Μάρκο',
    street: 'Via Cristoforo Colombo, 15',
    city: 'Ποζιτάνο',
    region: 'Σαλέρνο (SA)',
    country: 'Ιταλία',
  },
};

export function ContactInfoPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [texts, setTexts] = useState<Record<EditLang, ContactText>>(DEFAULTS);

  const current = texts[editLang];

  const update = (field: keyof ContactText, value: string) => {
    setTexts((prev) => ({
      ...prev,
      [editLang]: { ...prev[editLang], [field]: value },
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Information</h1>
          <p className={styles.subtitle}>Manage how guests can reach you</p>
        </div>
        <LangTabs value={editLang} onChange={setEditLang} />
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Owner Details</h2>

          <div className={styles.fieldRow}>
            {editLang === 'en' && (
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  className={styles.input}
                  defaultValue="Marco Rossi"
                />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <input
                type="text"
                className={styles.input}
                value={current.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                placeholder="Shown to guests"
              />
            </div>
          </div>
        </div>

        {editLang === 'en' && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Contact Methods</h2>

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                defaultValue="contact@sunsetvilla.com"
              />
              <span className={styles.fieldHint}>
                Used for booking confirmations and guest correspondence
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                className={styles.input}
                defaultValue="+39 089 123 4567"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>WhatsApp</label>
              <input
                type="tel"
                className={styles.input}
                defaultValue="+39 333 456 7890"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Property Address</h2>

          <div className={styles.field}>
            <label className={styles.label}>Street Address</label>
            <input
              type="text"
              className={styles.input}
              value={current.street}
              onChange={(e) => update('street', e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input
                type="text"
                className={styles.input}
                value={current.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Region / Province</label>
              <input
                type="text"
                className={styles.input}
                value={current.region}
                onChange={(e) => update('region', e.target.value)}
              />
            </div>
            {editLang === 'en' && (
              <div className={styles.field}>
                <label className={styles.label}>Postal Code</label>
                <input
                  type="text"
                  className={styles.input}
                  defaultValue="84017"
                />
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Country</label>
            <input
              type="text"
              className={styles.input}
              value={current.country}
              onChange={(e) => update('country', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton}>
            Save Changes
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setTexts((prev) => ({ ...prev, [editLang]: DEFAULTS[editLang] }))}
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
