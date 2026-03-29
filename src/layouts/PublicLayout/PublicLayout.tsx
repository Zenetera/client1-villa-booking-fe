import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/public/Navbar';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
