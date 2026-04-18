import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchVilla } from '../../api/villa';
import type { Villa } from '../../types/villa';
import { Navbar } from '../../components/public/Navbar';
import { Footer } from '../../components/public/Footer';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  const { lang } = useLanguage();
  const [villa, setVilla] = useState<Villa | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchVilla(lang)
      .then((data) => {
        if (!cancelled) {
          setVilla(data);
        }
      })
      .catch(() => {
        if (!cancelled) setVilla(null);
      });
    return () => { cancelled = true; };
  }, [lang]);

  return (
    <div className={styles.layout}>
      {villa && <Navbar villa={villa} />}
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
