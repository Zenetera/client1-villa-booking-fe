import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import styles from './Navbar.module.css';

export function Navbar() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Home className={styles.icon} size={24} />
          <span className={styles.brandName}>Villa Haven</span>
        </Link>
        
        <div className={styles.rightSection}>
          <div className={styles.navLinks}>
            <a href="#booking" onClick={(e) => scrollToSection(e, 'booking')} className={styles.navLink}>Booking</a>
            <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className={styles.navLink}>Gallery</a>
            <a href="#reviews" onClick={(e) => scrollToSection(e, 'reviews')} className={styles.navLink}>Location</a>
          </div>
          
          <a href="mailto:contact@villahaven.com" className={styles.contactButton}>
            Contact Us
          </a>
        </div>
      </div>
    </nav>
  );
}
