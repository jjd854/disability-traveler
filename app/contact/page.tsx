'use client'

import Navbar from '../../components/ui/Navbar'
import Footer from '../../components/ui/Footer'
import styles from './contact.module.css'

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <section className={styles.contactSection}>
        <h1>Contact / FAQ</h1>

        <div className={styles.contactTextBox}>
          <p>
            Questions, suggestions, need help, or just want to get in touch?
            <br />
            Email us at <a href="mailto:help@disabilitytraveler.com">help@disabilitytraveler.com</a>
          </p>
        </div>
      </section>

      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>

        <div className={styles.faqItem}>
          <p className={styles.question}>Q: Can I submit a review if the hotel I stayed at is not listed?</p>
          <p className={styles.answer}>Yes! You can choose "Not Listed" if the hotel isn’t shown, and your review will still be submitted and displayed on the selected destination page.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.question}>Q: How are accessibility ratings calculated?</p>
          <p className={styles.answer}>Ratings are averaged from reviews submitted by real travelers with disabilities. You can rate destinations and hotels separately.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.question}>Q: How does your pricing system work?</p>
          <p className={styles.answer}> Prices are relative to each destination. A “high” price rating in one place doesn’t always mean it’s expensive overall — it just reflects the general cost level for that area.</p>
        </div>
        
        <div className={styles.faqItem}>
          <p className={styles.question}>Q: Can I suggest a destination or hotel to add?</p>
          <p className={styles.answer}>Absolutely. Just send us a message with your suggestion and we’ll take a look.</p>
        </div>
      </section>

      <Footer />
    </>
  )
}






