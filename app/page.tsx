import Link from 'next/link';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import HomeSignupForm from '../components/ui/HomeSignupForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disability Traveler | Find Wheelchair Accessible Hotels & Resorts',

  description:
    'Discover wheelchair-accessible hotels and resorts with detailed accessibility information. Explore accessible rooms, bathrooms, pools, beaches, and amenities to plan your next vacation.',

  alternates: {
    canonical: 'https://disabilitytraveler.com',
  },

  openGraph: {
    title: 'Disability Traveler | Find Wheelchair Accessible Hotels & Resorts',
    description:
      'Discover wheelchair-accessible hotels and resorts with detailed accessibility information. Explore accessible rooms, bathrooms, pools, beaches, and amenities to plan your next vacation.',
    url: 'https://disabilitytraveler.com',
    siteName: 'Disability Traveler',
    type: 'website',
  },
};

export default function HomePage() {


  return (
    <>
      <Navbar />

      <section className="hero">
        <h1>Plan Accessible Travel with Confidence</h1>
        <p>Real accessibility insights for travelers with disabilities</p>
        <div className="hero-buttons">
          <Link href="/destinations" className="heroButton">Explore Destinations</Link>
          <Link href="/hotels" className="heroButton">Browse Hotels</Link>
          <Link href="/submit-review" className="heroButton">Submit a Review</Link>
        </div>
      </section>

      <section className="newsletterSection">
        <h2 className="sectionTitle">Stay in the Loop</h2>
        <p className="sectionSubtitle">
          Disability Traveler will send occasional emails with accessible travel updates. Unsubscribe anytime. 
        </p>

        <HomeSignupForm />
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="cards">
          <Link href="/destinations" className="card">          
            <h3>Choose a Destination</h3>
            <p>Explore listings curated for accessibility – Hotels, transport and attractions.</p>          
          </Link>
          <Link href="/hotels" className="card">
            <h3>Browse Hotels</h3>
            <p>Roll-in showers? Pool lifts? You’ll know before you go.</p>
          </Link>
          <Link href="/submit-review" className="card">
            <h3>Share or Read Reviews</h3>
            <p>Learn from real travelers and help others by sharing your own experiences.</p>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

