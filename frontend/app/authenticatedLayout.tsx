"use client";

import React from 'react';
import Nav from './components/nav';
import styles from './Style/authenticatedLayout.module.css';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutContainer}>
      <Nav />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}