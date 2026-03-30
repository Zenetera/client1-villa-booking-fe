import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Footer.module.css';

export function Footer() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleAdminClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(isAuthenticated ? '/admin' : '/admin/login');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <span className={styles.brandName}>Sunset Villa</span>
            <p className={styles.tagline}>Direct booking, no commissions.</p>
            <p className={styles.location}>Greece</p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Booking</h3>
            <nav className={styles.links}>
              <a href="#villa-details" onClick={(e) => scrollToSection(e, 'villa-details')} className={styles.link}>Villa details</a>
              <a href="#booking" onClick={(e) => scrollToSection(e, 'booking')} className={styles.link}>Availability</a>
              <a href="#booking" onClick={(e) => scrollToSection(e, 'booking')} className={styles.link}>Book now</a>
            </nav>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Owner</h3>
            <nav className={styles.links}>
              <a href="/admin" onClick={handleAdminClick} className={styles.link}>Admin dashboard</a>
              <Link to="/terms" className={styles.link}>Terms</Link>
              <Link to="/privacy" className={styles.link}>Privacy</Link>
            </nav>
          </div>
        </div>

        <button className={styles.moreButton} aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </footer>
  );
}
