import { useState } from 'react';
import { LangTabs } from '../../../components/admin/LangTabs';
import styles from './VillaEditorPage.module.css';

type EditLang = 'en' | 'el';

interface VillaText {
  name: string;
  location: string;
  tagline: string;
  description: string;
  amenities: string;
}

const DEFAULTS: Record<EditLang, VillaText> = {
  en: {
    name: 'Sunset Villa',
    location: 'Amalfi Coast, Italy',
    tagline: 'A serene coastal retreat with breathtaking views',
    description:
      'Nestled along the stunning Amalfi Coast, Sunset Villa offers an unforgettable Mediterranean escape. With panoramic sea views, sun-drenched terraces, and elegant interiors, this four-bedroom retreat is the perfect setting for a luxury holiday.',
    amenities: [
      'Private infinity pool',
      'Sea-view terrace',
      'Fully equipped kitchen',
      'Air conditioning',
      'Free Wi-Fi',
      'Private parking',
      'BBQ area',
      'Outdoor dining',
    ].join('\n'),
  },
  el: {
    name: 'Βίλα Sunset',
    location: 'Ακτή Αμάλφι, Ιταλία',
    tagline: 'Μια γαλήνια παραθαλάσσια απόδραση με εκπληκτική θέα',
    description:
      'Χτισμένη στην εντυπωσιακή Ακτή Αμάλφι, η Βίλα Sunset προσφέρει μια αξέχαστη μεσογειακή απόδραση. Με πανοραμική θέα στη θάλασσα, ηλιόλουστες βεράντες και κομψούς εσωτερικούς χώρους, αυτή η τετράκλινη βίλα είναι το ιδανικό σκηνικό για πολυτελείς διακοπές.',
    amenities: [
      'Ιδιωτική πισίνα υπερχείλισης',
      'Βεράντα με θέα στη θάλασσα',
      'Πλήρως εξοπλισμένη κουζίνα',
      'Κλιματισμός',
      'Δωρεάν Wi-Fi',
      'Ιδιωτικό πάρκινγκ',
      'Χώρος BBQ',
      'Υπαίθρια τραπεζαρία',
    ].join('\n'),
  },
};

export function VillaEditorPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [texts, setTexts] = useState<Record<EditLang, VillaText>>(DEFAULTS);

  const current = texts[editLang];

  const update = (field: keyof VillaText, value: string) => {
    setTexts((prev) => ({
      ...prev,
      [editLang]: { ...prev[editLang], [field]: value },
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Villa Details</h1>
          <p className={styles.subtitle}>Update your property information</p>
        </div>
        <LangTabs value={editLang} onChange={setEditLang} />
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Villa Name</label>
              <input
                type="text"
                className={styles.input}
                value={current.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Location</label>
              <input
                type="text"
                className={styles.input}
                value={current.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tagline</label>
            <input
              type="text"
              className={styles.input}
              value={current.tagline}
              onChange={(e) => update('tagline', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              rows={5}
              value={current.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </div>

        {editLang === 'en' && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Property Details</h2>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Bedrooms</label>
                <input
                  type="number"
                  className={styles.input}
                  defaultValue={4}
                  min={1}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Bathrooms</label>
                <input
                  type="number"
                  className={styles.input}
                  defaultValue={3}
                  min={1}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Max Guests</label>
                <input
                  type="number"
                  className={styles.input}
                  defaultValue={8}
                  min={1}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Amenities</h2>
          <p className={styles.fieldHint}>
            Enter one amenity per line
          </p>
          <textarea
            className={styles.textarea}
            rows={6}
            value={current.amenities}
            onChange={(e) => update('amenities', e.target.value)}
          />
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
