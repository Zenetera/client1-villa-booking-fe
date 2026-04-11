import { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchPageBySlug, PRIVACY_SLUG, type SitePage } from '../../../api/sitePage';
import { renderSitePageContent } from '../../../utils/renderSitePageContent';
import styles from './PrivacyPage.module.css';

export function PrivacyPage() {
  const { lang } = useLanguage();
  const [page, setPage] = useState<SitePage | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPageBySlug(PRIVACY_SLUG)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled) setHasLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isEl = lang === 'el';
  const title = page ? ((isEl && page.titleEl) || page.titleEn) : '';
  const content = page ? ((isEl && page.contentEl) || page.contentEn) : '';
  const errorMessage = isEl ? 'Δεν ήταν δυνατή η φόρτωση της πολιτικής απορρήτου.' : 'Unable to load privacy policy.';
  const lastModifiedLabel = isEl ? 'Τελευταία ενημέρωση' : 'Last modified';
  const lastModified = page
    ? new Date(page.lastModified).toLocaleDateString(isEl ? 'el-GR' : 'en-GB', {
        year: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <div className={styles.container}>
      <article className={styles.content}>
        {loading && <p>{isEl ? 'Φόρτωση…' : 'Loading…'}</p>}
        {hasLoadError && !loading && <p>{errorMessage}</p>}
        {page && !loading && (
          <>
            <h1>{title}</h1>
            {renderSitePageContent(content)}
            <p className={styles.lastUpdated}>
              {lastModifiedLabel}
              {': '}
              {lastModified}
            </p>
          </>
        )}
      </article>
    </div>
  );
}
