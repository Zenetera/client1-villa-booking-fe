import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/public/Navbar';
import styles from './PublicLayout.module.css';

export const PublicLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
