import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Home, Menu, X } from 'lucide-react';
import type { Villa } from '../../../types/villa';
import { useLanguage } from '../../../hooks/useLanguage';
import styles from './Navbar.module.css';

interface VillaDetailsProps {
  villa: Villa;
}
export function Navbar({ villa }: VillaDetailsProps) {
  const { name} = villa;
  const { lang, toggleLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Home className={styles.icon} size={24} />
          <span className={styles.brandName}>{name}</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {menuOpen && (
          <div className={styles.mobileBackdrop} onClick={() => setMenuOpen(false)} />
        )}

        <div
          ref={menuRef}
          className={`${styles.rightSection} ${menuOpen ? styles.rightSectionOpen : ''}`}
        >
          <button
            className={styles.closeMenu}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

          <div className={styles.navLinks}>
            <a href="#booking" onClick={(e) => scrollToSection(e, 'booking')} className={styles.navLink}>{t.nav.booking}</a>
            <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className={styles.navLink}>{t.nav.gallery}</a>
            <a href="#location" onClick={(e) => scrollToSection(e, 'location')} className={styles.navLink}>{t.nav.location}</a>
          </div>

          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={styles.contactButton}>
            {t.nav.contactUs}
          </a>

          <button
            className={styles.langToggle}
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch to Greek' : 'Αλλαγή σε Αγγλικά'}
          >
            <Globe size={14} className={styles.langGlobe} />
            <span>{lang === 'en' ? 'EL' : 'EN'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
