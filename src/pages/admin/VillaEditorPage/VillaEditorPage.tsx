import { useEffect, useState, useCallback } from 'react';
import { fetchVillaAdmin, updateVillaDetails } from '../../../api/admin';
import type { VillaAdmin, UpdateVillaInput } from '../../../api/admin';
import { LangTabs } from '../../../components/admin/LangTabs';
import styles from './VillaEditorPage.module.css';

type EditLang = 'en' | 'el';

interface VillaFormState {
  nameEn: string;
  nameEl: string;
  descriptionEn: string;
  descriptionEl: string;
  shortDescriptionEn: string;
  shortDescriptionEl: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  maxGuests: string;
  amenitiesEn: string;
  amenitiesEl: string;
  houseRulesEn: string;
  houseRulesEl: string;
  checkInTime: string;
  checkOutTime: string;
}

function villaToForm(v: VillaAdmin): VillaFormState {
  return {
    nameEn: v.nameEn,
    nameEl: v.nameEl ?? '',
    descriptionEn: v.descriptionEn,
    descriptionEl: v.descriptionEl ?? '',
    shortDescriptionEn: v.shortDescriptionEn,
    shortDescriptionEl: v.shortDescriptionEl ?? '',
    address: v.address,
    bedrooms: String(v.bedrooms),
    bathrooms: String(v.bathrooms),
    maxGuests: String(v.maxGuests),
    amenitiesEn: Array.isArray(v.amenitiesEn) ? v.amenitiesEn.join('\n') : '',
    amenitiesEl: Array.isArray(v.amenitiesEl) ? v.amenitiesEl.join('\n') : '',
    houseRulesEn: v.houseRulesEn ?? '',
    houseRulesEl: v.houseRulesEl ?? '',
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
  };
}

function formToPayload(form: VillaFormState): UpdateVillaInput {
  return {
    nameEn: form.nameEn,
    nameEl: form.nameEl || null,
    descriptionEn: form.descriptionEn,
    descriptionEl: form.descriptionEl || null,
    shortDescriptionEn: form.shortDescriptionEn,
    shortDescriptionEl: form.shortDescriptionEl || null,
    address: form.address,
    bedrooms: parseInt(form.bedrooms) || 1,
    bathrooms: parseInt(form.bathrooms) || 1,
    maxGuests: parseInt(form.maxGuests) || 1,
    amenitiesEn: form.amenitiesEn.split('\n').map((s) => s.trim()).filter(Boolean),
    amenitiesEl: form.amenitiesEl
      ? form.amenitiesEl.split('\n').map((s) => s.trim()).filter(Boolean)
      : null,
    houseRulesEn: form.houseRulesEn || null,
    houseRulesEl: form.houseRulesEl || null,
    checkInTime: form.checkInTime,
    checkOutTime: form.checkOutTime,
  };
}

export function VillaEditorPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [form, setForm] = useState<VillaFormState | null>(null);
  const [savedForm, setSavedForm] = useState<VillaFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const villa = await fetchVillaAdmin();
      const state = villaToForm(villa);
      setForm(state);
      setSavedForm(state);
    } catch {
      setError('Failed to load villa details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Loading villa details...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className={styles.page}>
        <p className={styles.errorMsg}>{error || 'Villa not found'}</p>
      </div>
    );
  }

  const update = (field: keyof VillaFormState, value: string) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const villa = await updateVillaDetails(formToPayload(form));
      const state = villaToForm(villa);
      setForm(state);
      setSavedForm(state);
      setSuccess('Villa details saved');
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
          <h1 className={styles.title}>Villa Details</h1>
          <p className={styles.subtitle}>Update your property information</p>
        </div>
        <LangTabs value={editLang} onChange={setEditLang} />
      </div>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Villa Name</label>
              <input
                type="text"
                className={styles.input}
                value={editLang === 'en' ? form.nameEn : form.nameEl}
                onChange={(e) =>
                  update(editLang === 'en' ? 'nameEn' : 'nameEl', e.target.value)
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Location</label>
              <input
                type="text"
                className={styles.input}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                disabled={editLang === 'el'}
              />
              {editLang === 'el' && (
                <span className={styles.fieldHintInline}>
                  Location is language-independent
                </span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tagline</label>
            <input
              type="text"
              className={styles.input}
              value={
                editLang === 'en' ? form.shortDescriptionEn : form.shortDescriptionEl
              }
              onChange={(e) =>
                update(
                  editLang === 'en' ? 'shortDescriptionEn' : 'shortDescriptionEl',
                  e.target.value,
                )
              }
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              rows={5}
              value={editLang === 'en' ? form.descriptionEn : form.descriptionEl}
              onChange={(e) =>
                update(
                  editLang === 'en' ? 'descriptionEn' : 'descriptionEl',
                  e.target.value,
                )
              }
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
                  value={form.bedrooms}
                  onChange={(e) => update('bedrooms', e.target.value)}
                  min={1}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Bathrooms</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.bathrooms}
                  onChange={(e) => update('bathrooms', e.target.value)}
                  min={1}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Max Guests</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.maxGuests}
                  onChange={(e) => update('maxGuests', e.target.value)}
                  min={1}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Check-in Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={form.checkInTime}
                  onChange={(e) => update('checkInTime', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Check-out Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={form.checkOutTime}
                  onChange={(e) => update('checkOutTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Amenities</h2>
          <p className={styles.fieldHint}>Enter one amenity per line</p>
          <textarea
            className={styles.textarea}
            rows={6}
            value={editLang === 'en' ? form.amenitiesEn : form.amenitiesEl}
            onChange={(e) =>
              update(editLang === 'en' ? 'amenitiesEn' : 'amenitiesEl', e.target.value)
            }
          />
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>House Rules</h2>
          <textarea
            className={styles.textarea}
            rows={4}
            value={editLang === 'en' ? form.houseRulesEn : form.houseRulesEl}
            onChange={(e) =>
              update(
                editLang === 'en' ? 'houseRulesEn' : 'houseRulesEl',
                e.target.value,
              )
            }
            placeholder="Enter house rules..."
          />
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleDiscard}
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
