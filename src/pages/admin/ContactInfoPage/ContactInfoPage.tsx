import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchContactInfo, updateContactInfo } from '../../../api/admin';
import type { ContactInfo, UpdateContactInput } from '../../../api/admin';
import styles from './ContactInfoPage.module.css';

interface ContactFormState {
  ownerFullName: string;
  ownerDisplayName: string;
  email: string;
  phone: string;
  whatsapp: string;
}

function contactToForm(c: ContactInfo): ContactFormState {
  return {
    ownerFullName: c.ownerFullName,
    ownerDisplayName: c.ownerDisplayName,
    email: c.email,
    phone: c.phone ?? '',
    whatsapp: c.whatsapp ?? '',
  };
}

function formToPayload(form: ContactFormState, c: ContactInfo): UpdateContactInput {
  return {
    ownerFullName: form.ownerFullName,
    ownerDisplayName: form.ownerDisplayName,
    email: form.email,
    phone: form.phone || null,
    whatsapp: form.whatsapp || null,
    streetAddress: c.streetAddress,
    city: c.city,
    region: c.region,
    postalCode: c.postalCode,
    country: c.country,
  };
}

const EMPTY_FORM: ContactFormState = {
  ownerFullName: '',
  ownerDisplayName: '',
  email: '',
  phone: '',
  whatsapp: '',
};

export function ContactInfoPage() {
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ContactFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const contactRef = useRef<ContactInfo | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const contact = await fetchContactInfo();
      contactRef.current = contact;
      const state = contactToForm(contact);
      setForm(state);
      setSavedForm(state);
    } catch {
      setError('Failed to load contact information');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!contactRef.current) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const contact = await updateContactInfo(formToPayload(form, contactRef.current));
      contactRef.current = contact;
      const state = contactToForm(contact);
      setForm(state);
      setSavedForm(state);
      setSuccess('Contact information saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (savedForm) {
      setForm(savedForm);
    }
    setError('');
    setSuccess('');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Information</h1>
          <p className={styles.subtitle}>Manage how guests can reach you</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <fieldset className={styles.form} disabled={!savedForm}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Owner Details</h2>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="owner-full-name">Full Name</label>
              <input
                id="owner-full-name"
                type="text"
                className={styles.input}
                value={form.ownerFullName}
                onChange={(e) => update('ownerFullName', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="owner-display-name">Display Name</label>
              <input
                id="owner-display-name"
                type="text"
                className={styles.input}
                value={form.ownerDisplayName}
                onChange={(e) => update('ownerDisplayName', e.target.value)}
                placeholder="Shown to guests"
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Contact Methods</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-email">Email Address</label>
            <input
              id="contact-email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            <span className={styles.fieldHint}>
              Used for booking confirmations and guest correspondence
            </span>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-phone">Phone Number</label>
              <input
                id="contact-phone"
                type="tel"
                className={styles.input}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-whatsapp">WhatsApp</label>
              <input
                id="contact-whatsapp"
                type="tel"
                className={styles.input}
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={saving || !savedForm}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleDiscard}
            disabled={!savedForm}
          >
            Discard
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
