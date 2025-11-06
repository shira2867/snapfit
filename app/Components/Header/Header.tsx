'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';
import logo from '../../../public/logo.png';
import user from '../../../public/user.png';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Project Logo" width={80} height={80} />
        </Link>
      </div>

      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        <Link href="/home" className={styles.link} onClick={() => setIsOpen(false)}>Home</Link>
        <Link href="/about" className={styles.link} onClick={() => setIsOpen(false)}>About</Link>
        <Link href="/mycloset" className={styles.link} onClick={() => setIsOpen(false)}>My Closet</Link>
        <Link href="/newcloth" className={styles.link} onClick={() => setIsOpen(false)}>New Cloth</Link>
        <Link href="/mylooks" className={styles.link} onClick={() => setIsOpen(false)}>My Looks</Link>
        <Link href="/stylefeed" className={styles.link} onClick={() => setIsOpen(false)}>Style Feed</Link>
      </nav>

      <button className={styles.userButton}>
        <Image src={user} alt="User Icon" width={40} height={40} />
      </button>
    </header>
  );
}
