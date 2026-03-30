import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Sunset Villa</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sign out
        </button>
      </div>

      <div className={styles.placeholder}>
        <p>Dashboard coming soon. Backend integration in progress.</p>
      </div>
    </div>
  );
}
