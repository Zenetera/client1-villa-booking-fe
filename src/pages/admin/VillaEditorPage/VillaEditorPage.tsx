import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchVillaAdmin,
  updateVillaDetails,
  fetchContactInfo,
  updateContactInfo,
} from '../../../api/admin';
import type { VillaAdmin, UpdateVillaInput, ContactInfo } from '../../../api/admin';
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
  streetAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
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

function villaToForm(v: VillaAdmin, c: ContactInfo | null): VillaFormState {
  return {
    nameEn: v.nameEn,
    nameEl: v.nameEl ?? '',
    descriptionEn: v.descriptionEn,
    descriptionEl: v.descriptionEl ?? '',
    shortDescriptionEn: v.shortDescriptionEn,
    shortDescriptionEl: v.shortDescriptionEl ?? '',
    streetAddress: c?.streetAddress ?? '',
    city: c?.city ?? '',
    region: c?.region ?? '',
    postalCode: c?.postalCode ?? '',
    country: c?.country ?? '',
    latitude: v.latitude ?? '',
    longitude: v.longitude ?? '',
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
    address: [form.streetAddress, form.city, form.region, form.postalCode, form.country]
      .filter(Boolean)
      .join(', '),
    latitude: form.latitude ? (Number.isFinite(parseFloat(form.latitude)) ? parseFloat(form.latitude) : null) : null,
    longitude: form.longitude ? (Number.isFinite(parseFloat(form.longitude)) ? parseFloat(form.longitude) : null) : null,
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

const EMPTY_FORM: VillaFormState = {
  nameEn: '',
  nameEl: '',
  descriptionEn: '',
  descriptionEl: '',
  shortDescriptionEn: '',
  shortDescriptionEl: '',
  streetAddress: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  latitude: '',
  longitude: '',
  bedrooms: '1',
  bathrooms: '1',
  maxGuests: '1',
  amenitiesEn: '',
  amenitiesEl: '',
  houseRulesEn: '',
  houseRulesEl: '',
  checkInTime: '',
  checkOutTime: '',
};

export function VillaEditorPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [form, setForm] = useState<VillaFormState>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<VillaFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const contactRef = useRef<ContactInfo | null>(null);
  const villaLoadedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [villa, contact] = await Promise.all([
        fetchVillaAdmin(),
        fetchContactInfo().catch(() => null),
      ]);
      contactRef.current = contact;
      villaLoadedRef.current = true;
      const state = villaToForm(villa, contact);
      setForm(state);
      setSavedForm(state);
    } catch {
      setError('Failed to load villa details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field: keyof VillaFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!villaLoadedRef.current) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const c = contactRef.current;
      const contactLoaded = c !== null;
      const [villa, contact] = await Promise.all([
        updateVillaDetails(formToPayload(form)),
        contactLoaded
          ? updateContactInfo({
              ownerFullName: c.ownerFullName,
              ownerDisplayName: c.ownerDisplayName,
              email: c.email,
              phone: c.phone ?? null,
              whatsapp: c.whatsapp ?? null,
              streetAddress: form.streetAddress,
              city: form.city,
              region: form.region || null,
              postalCode: form.postalCode,
              country: form.country,
            })
          : Promise.resolve(null),
      ]);
      if (contact) contactRef.current = contact;
      const state = villaToForm(villa, contact);
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

      {isLoading ? (
        <div className={styles.form}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.field}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonInput} />
            </div>
            <div className={styles.field}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonInput} />
            </div>
            <div className={styles.field}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonTextarea} />
            </div>
          </div>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Property Address</h2>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.field}>
                <div className={styles.skeletonLabel} />
                <div className={styles.skeletonInput} />
              </div>
            ))}
          </div>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Property Details</h2>
            <div className={styles.fieldRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.field}>
                  <div className={styles.skeletonLabel} />
                  <div className={styles.skeletonInput} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !savedForm ? (
        <div className={styles.form}>
          <div className={styles.card}>
            <p className={styles.errorMsg}>{error || 'Failed to load villa details'}</p>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSave}>
        <fieldset className={styles.form} disabled={!savedForm}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>

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
            <h2 className={styles.sectionTitle}>Property Address</h2>

            <div className={styles.field}>
              <label className={styles.label}>Street Address</label>
              <input
                type="text"
                className={styles.input}
                value={form.streetAddress}
                onChange={(e) => update('streetAddress', e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Region / Province</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Postal Code</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Country</label>
              <input
                type="text"
                className={styles.input}
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Latitude</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={form.latitude}
                  onChange={(e) => update('latitude', e.target.value)}
                  placeholder="e.g. 40.633333"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Longitude</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={form.longitude}
                  onChange={(e) => update('longitude', e.target.value)}
                  placeholder="e.g. 14.560055"
                />
              </div>
            </div>
            <span className={styles.fieldHintInline}>
              Right-click your location on Google Maps and copy the coordinates
            </span>
          </div>
        )}

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
      )}
    </div>
  );
}
