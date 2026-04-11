import { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchPageBySlug, TERMS_SLUG, type SitePage } from '../../../api/sitePage';
import { renderSitePageContent } from '../../../utils/renderSitePageContent';
import styles from './TermsPage.module.css';

export function TermsPage() {
  const { lang } = useLanguage();
  const [page, setPage] = useState<SitePage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPageBySlug(TERMS_SLUG)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load terms and conditions.');
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
  const lastUpdatedLabel = isEl ? 'Τελευταία ενημέρωση' : 'Last updated';
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
        {error && !loading && <p>{error}</p>}
        {page && !loading && (
          <>
            <h1>{title}</h1>
            {renderSitePageContent(content)}
            <p className={styles.lastUpdated}>
              {lastUpdatedLabel}
              {': '}
              {lastModified}
            </p>
          </>
        )}
      </article>
    </div>
  );
}
