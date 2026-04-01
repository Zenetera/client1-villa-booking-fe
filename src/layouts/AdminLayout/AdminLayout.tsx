import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <div className={styles.mobileHeader}>
          <button
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>Sunset Villa</span>
        </div>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
