import { NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CalendarDays,
  Home,
  Image,
  Mail,
  FileText,
  ShieldCheck,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const pendingCount = 3;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div>
            <span className={styles.brandName}>Sunset Villa</span>
            <span className={styles.brandSub}>Admin</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <ClipboardList size={16} />
            <span>Bookings</span>
            {pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
          </NavLink>
          <NavLink
            to="/admin/calendar"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <CalendarDays size={16} />
            <span>Calendar</span>
          </NavLink>

          <div className={styles.divider} />

          <NavLink
            to="/admin/villa"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <Home size={16} />
            <span>Villa Details</span>
          </NavLink>
          <NavLink
            to="/admin/images"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <Image size={16} />
            <span>Images</span>
          </NavLink>
          <NavLink
            to="/admin/contact"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <Mail size={16} />
            <span>Contact Info</span>
          </NavLink>
          <NavLink
            to="/admin/terms"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <FileText size={16} />
            <span>Terms &amp; Conditions</span>
          </NavLink>
          <NavLink
            to="/admin/privacy"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <ShieldCheck size={16} />
            <span>Privacy Policy</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            <ExternalLink size={14} />
            <span>View live site</span>
          </a>
          <button onClick={handleLogout} className={styles.footerButton}>
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
