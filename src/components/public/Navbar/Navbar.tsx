import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import styles from './Navbar.module.css';

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Home className={styles.icon} size={24} />
          <span className={styles.brandName}>Villa Haven</span>
        </Link>
        <a href="mailto:contact@villahaven.com" className={styles.contactButton}>
          Contact Us
        </a>
      </div>
    </nav>
  );
}
