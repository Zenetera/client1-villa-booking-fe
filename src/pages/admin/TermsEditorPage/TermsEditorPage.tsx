import { useCallback, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { LangTabs } from '../../../components/admin/LangTabs';
import {
  fetchAdminPages,
  fetchAdminPageById,
  updateSitePage,
  TERMS_SLUG,
  type SitePage,
} from '../../../api/sitePage';
import styles from './TermsEditorPage.module.css';

type EditLang = 'en' | 'el';

interface FormState {
  titleEn: string;
  titleEl: string;
  contentEn: string;
  contentEl: string;
}

function pageToForm(page: SitePage): FormState {
  return {
    titleEn: page.titleEn,
    titleEl: page.titleEl ?? '',
    contentEn: page.contentEn,
    contentEl: page.contentEl ?? '',
  };
}

const EMPTY_FORM: FormState = {
  titleEn: '',
  titleEl: '',
  contentEn: '',
  contentEl: '',
};

export function TermsEditorPage() {
  const [editLang, setEditLang] = useState<EditLang>('en');
  const [page, setPage] = useState<SitePage | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const pages = await fetchAdminPages();
      const match = pages.find((p) => p.slug === TERMS_SLUG);
      if (!match) {
        setError('Terms and conditions page not found');
        return;
      }
      const full = await fetchAdminPageById(match.id);
      setPage(full);
      const state = pageToForm(full);
      setForm(state);
      setSavedForm(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!page || !form) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await updateSitePage(page.id, {
        titleEn: form.titleEn,
        titleEl: form.titleEl.trim() ? form.titleEl : null,
        contentEn: form.contentEn,
        contentEl: form.contentEl.trim() ? form.contentEl : null,
      });
      setPage(updated);
      const state = pageToForm(updated);
      setForm(state);
      setSavedForm(state);
      setSuccess('Terms and conditions saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (savedForm) setForm(savedForm);
    setError('');
    setSuccess('');
  }

  const lastModifiedLabel = page
    ? new Date(page.lastModified).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
          <p className={styles.subtitle}>Edit the terms of service shown to guests</p>
        </div>
        <div className={styles.headerControls}>
          <LangTabs value={editLang} onChange={setEditLang} />
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewLink}
          >
            <ExternalLink size={14} />
            View live page
          </a>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Title</h2>
            <div className={styles.field}>
              <input
                type="text"
                className={styles.input}
                value={editLang === 'en' ? form.titleEn : form.titleEl}
                onChange={(e) =>
                  update(editLang === 'en' ? 'titleEn' : 'titleEl', e.target.value)
                }
                placeholder={editLang === 'en' ? 'Terms of Service' : 'Όροι χρήσης'}
              />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.sectionTitle}>Content</h2>
              <span className={styles.formatHint}>
                Use a blank line to separate paragraphs, and two blank lines before a new
                section heading. Start a list item with &bull; followed by a space.
              </span>
            </div>
            <textarea
              className={styles.editor}
              value={editLang === 'en' ? form.contentEn : form.contentEl}
              onChange={(e) =>
                update(editLang === 'en' ? 'contentEn' : 'contentEl', e.target.value)
              }
              rows={36}
              spellCheck
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}
          {page && !error && !success && (
            <p className={styles.metaHint}>Last modified: {lastModifiedLabel}</p>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard
            </button>
          </div>
        </form>
    </div>
  );
}
