import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span>© {new Date().getFullYear()} Disability Traveler LLC</span>
        </div>
        <nav className={styles.nav}>
         <div className={styles.navRow}>
           <Link href="/privacy">Privacy Policy</Link>
           <span className={styles.sep}>•</span>
           <Link href="/terms">Terms of Service</Link>
         </div>
         <div className={styles.navRow}>
           <Link href="/disclaimer">Disclaimer</Link>
           <span className={styles.sep}>•</span>
           <Link href="/forhotels">For Hotels</Link>
         </div>
       </nav>
      </div>
    </footer>
  );
}

