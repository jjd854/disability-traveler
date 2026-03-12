import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';    
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Disability Traveler',
  description:
    'Informational-only disclaimer for Disability Traveler. Verify accessibility details directly with providers before booking.',
};

export default function Page() {
  return (
   <>
    <Navbar />
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 20px' }}>
      <article>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Disclaimer</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          <em>Effective Date: March 13, 2026</em>
        </p>
        <p style={{ marginBottom: 16 }}>
          The information on <strong>Disability Traveler</strong> is provided for general
          informational purposes only. While we strive for accuracy, accessibility
          details and traveler experiences may vary. Accessibility conditions may change over time and can vary by room type, renovation status, staffing, or individual circumstances. Disability Traveler LLC does not
          guarantee the completeness or reliability of any reviews, photos, or third-party
          information displayed on this site.
        </p>
        <p>
          All travel decisions are made at your own discretion. We encourage travelers to
          verify accessibility features directly with hotels, destinations, or service
          providers before booking.
        </p>
      </article>
    </main>
    <Footer />
   </>
  );
}

