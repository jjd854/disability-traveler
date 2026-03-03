'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      {/* Brand / Home link */}
      <Link href="/" aria-label="Go to Disability Traveler homepage" className={styles.brandLink}>
        <Image
          src="/brand/disability_traveler_logo_navbar.png.png"  // or /brand/disability_traveler_logo_primary.svg
          alt="Disability Traveler — accessible travel reviews"
          width={200}
          height={68}
          priority
          className={styles.logoImg}
        />
      </Link>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <nav className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`}>
        <Link href="/destinations">Destinations</Link>
        <Link href="/hotels">Hotels</Link>
        <Link href="/submit-review">Submit Review</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/about">About</Link>
        <Link href="/forhotels">For Hotels</Link>
      </nav>
    </header>
  );
};

export default Navbar;






