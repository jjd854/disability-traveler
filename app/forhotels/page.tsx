// app/forhotels/page.tsx (Server Component-safe)
// Uses CSS Modules (./ForHotels.module.css) instead of styled-jsx to avoid
// the "client-only cannot be imported from a Server Component" error.
// Keep this file as a Server Component so the static `metadata` export works.

import React from "react";
import Link from "next/link";
import styles from "./ForHotels.module.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "Partner With Us | Disability Traveler — For Hotels",
  description:
    "Showcase your accessible rooms and amenities to travelers who need them most. Join Disability Traveler to highlight accessibility features, earn trust, and drive bookings.",
  openGraph: {
    title: "Partner With Us | Disability Traveler — For Hotels",
    description:
      "Showcase your accessible rooms and amenities to travelers who need them most.",
    type: "website",
    url: "https://www.disabilitytraveler.com/forhotels",
  },
};

export default function ForHotelsPage() {
  const faqs = [
    {
      q: "How much does it cost to be listed?",
      a: "It’s free to be listed on Disability Traveler. We want every accessible hotel discoverable. Optional promotional placements may be available later, but listing is free.",
    },
    {
      q: "What content do you need from us?",
      a: "A short property summary, a list of accessibility features (property + rooms), your accessible room categories, and 6–10 professional photos with usage permission.",
    },
    {
      q: "Can we update our listing later?",
      a: "Yes. You can request updates to your amenities, photos, and room categories at any time so travelers see accurate information.",
    },
    {
      q: "How are ratings calculated?",
      a: "Ratings are averaged from traveler reviews on property and room-level accessibility. We moderate submissions and surface detailed context, not sensational snippets.",
    },
  ];

  const benefits = [
    {
      title: "Reach high-intent travelers",
      text: "Connect with guests specifically searching for accessible stays, families, wheelchair users, and travelers with mobility needs.",
    },
    {
      title: "Showcase verified accessibility",
      text: "Display clear, visual proof of your features: roll-in showers, pool lifts, beach wheelchairs, elevators, doorway widths, and more.",
    },
    {
      title: "Room-category level clarity",
      text: "List accessible room types and amenities so guests can book with confidence and fewer pre-arrival calls.",
    },
    {
      title: "Build trust with real reviews",
      text: "Fair, structured reviews with traveler photos, designed to inform, not outrage.",
    },
  ];

  const checklist = [
    "Property summary (100–200 words)",
    "Accessibility features (property): elevators, parking, ramps, pathways, pool lift, accessible restaurant/fitness, etc.",
    "Accessibility features (rooms): roll‑in shower, tub with bench, lowered bed, 32\" doorway, grab bars, etc.",
    "Accessible room categories with up to 4 photos per category (names + key features)",
    "Up to 10 professional property photos + usage permission",
    "Website URL, phone, address, contact for updates",
  ];

  return (
    <>
      <Navbar />
      <main className={styles.wrap} aria-labelledby="pageTitle">
        {/* SEO JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "Partner With Us — For Hotels",
              description:
                "Disability Traveler partners with hotels to highlight accessible rooms and amenities to mobility-focused travelers.",
              isPartOf: {
                "@type": "WebSite",
                name: "Disability Traveler",
                url: "https://www.disabilitytraveler.com",
              },
            }),
          }}
        />

        {/* HERO */}
        <section className={styles.hero}>
          <h1 id="pageTitle" className={styles.h1}>Showcase Your Accessible Stays</h1>
          <p className={styles.tagline}>
            Reach travelers who actively need accessibility details. Build trust with
            transparent features, room-level clarity, and real reviews.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.ctaPrimary} href="/forhotels/intake">Get Listed</Link>
            <a className={styles.ctaSecondary} href="mailto:help@disabilitytraveler.com">Email Us</a>
          </div>
          <p className={styles.micro}>Independent, accessibility‑focused reviews since 2025 - free for hotels to list</p>
        </section>

        {/* BENEFITS */}
        <section className={styles.section} aria-labelledby="benefitsTitle">
          <h2 id="benefitsTitle" className={styles.h2}>Why Hotels Partner With Disability Traveler</h2>
          <ul className={styles.benefitGrid} role="list">
            {benefits.map((b) => (
              <li key={b.title} className={styles.benefitCard}>
                <h3 className={styles.h3}>{b.title}</h3>
                <p>{b.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section} aria-labelledby="howTitle">
          <h2 id="howTitle" className={styles.h2}>How It Works</h2>
          <ol className={styles.steps} aria-label="Steps to get listed">
            <li className={styles.stepItem}>
              <span className={styles.stepNum}>1</span>
              <div>
                <strong>Send your details.</strong> Provide property accessibility features, which room
                categories that have accessible features and features they have, up to 10 property photos and up to 4 photos per accessible room category (with usage permission).
              </div>
            </li>
            <li className={styles.stepItem}>
              <span className={styles.stepNum}>2</span>
              <div>
                <strong>We build your listing.</strong> Clear cards, uniform images, and
                room‑level info with icons for quick scanning.
              </div>
            </li>
            <li className={styles.stepItem}>
              <span className={styles.stepNum}>3</span>
              <div>
                <strong>Go live & get reviews.</strong> Travelers share real experiences;
                you can request updates anytime.
              </div>
            </li>
          </ol>
        </section>

        {/* WHAT WE NEED */}
        <section className={styles.section} aria-labelledby="needTitle">
          <h2 id="needTitle" className={styles.h2}>What We Need From You</h2>
          <ul className={styles.checklist} role="list">
            {checklist.map((item, i) => (
              <li key={i} className={styles.checkItem}>{item}</li>
            ))}
          </ul>
          <div className={styles.note}>
            <p>
              <strong>Photo usage:</strong> Professional photos are preferred. Please
              confirm we have permission to display them on your listing.
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className={styles.section} aria-labelledby="proofTitle">
          <h2 id="proofTitle" className={styles.h2}>Built for Trust</h2>
          <div className={styles.proofGrid}>
            <div className={styles.proofCard}>
              <p className={styles.quote}>
                “We finally found a clear way to display accessible room categories. DT makes
                it obvious what guests can expect.”
              </p>
              <p className={styles.attribution}>— Example GM, Airport Hotel</p>
            </div>
            <div className={styles.proofCard}>
              <p className={styles.quote}>
                “The reviews are fair and detailed. Guests arrive confident, and our front
                desk gets fewer pre‑arrival calls.”
              </p>
              <p className={styles.attribution}>— Example Front Office Manager</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection} aria-labelledby="ctaTitle">
          <h2 id="ctaTitle" className={styles.h2}>Ready to Get Listed?</h2>
          <p className={styles.ctaCopy}>
            We’ll help you present accessibility clearly and attract the travelers who
            need your features most.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.ctaPrimary} href="/forhotels/intake">Get Listed</Link>
            <a className={styles.ctaSecondary} href="mailto:help@disabilitytraveler.com">Email Us</a>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section} aria-labelledby="faqTitle">
          <h2 id="faqTitle" className={styles.h2}>FAQs for Hotels</h2>
          <dl className={styles.faq}>
            {faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <dt className={styles.faqQ}>{f.q}</dt>
                <dd className={styles.faqA}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className={`${styles.micro} ${styles.endNote}`}>
          Questions? Email <a href="mailto:help@disabilitytraveler.com">help@disabilitytraveler.com</a>
        </p>
      </main>
      <Footer />
    </>
  );
}

