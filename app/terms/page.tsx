import type { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Service | Disability Traveler',
  description:
    'Terms of Service for Disability Traveler LLC. Learn the rules for using our website, reviews, and content.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 20px' }}>
        <article>
          <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            <em>Effective Date: March 13, 2026</em>
          </p>

          <p>
            Welcome to <strong>Disability Traveler</strong> (“we,” “our,” or “us”). By
            accessing or using disabilitytraveler.com (“the Site”), you agree to these Terms
            of Service and our <a href="/privacy">Privacy Policy</a>.
          </p>

          <h2>1. Eligibility</h2>
          <p>You must be at least 18 years old to submit reviews or upload content.</p>

          <h2>2. User-Generated Content</h2>
          <p>
            By submitting reviews, photos, or other materials (“User Content”), you grant
            Disability Traveler LLC a non-exclusive, worldwide, royalty-free license to use,
            display, and distribute that content on our site and social channels.
          </p>
          <p>
            You are solely responsible for the content you submit and must ensure that it does not violate any third-party rights or applicable laws.
          </p>
          <p>You remain the owner of your content but agree it may appear publicly.</p>

          <h2>3. Prohibited Uses</h2>
          <ul>
            <li>Posting false, misleading, or offensive reviews.</li>
            <li>Uploading harmful code or violating any law.</li>
            <li>Using bots or automated tools to collect data.</li>
          </ul>

          <h2>4. Accuracy of Information</h2>
          <p>
            While we strive for accuracy, we cannot guarantee that all information on our
            Site is complete or error-free. Always verify details directly with travel
            providers.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All site text, images, and code are owned or licensed by Disability Traveler
            LLC. You may not copy or reuse content without written permission.
          </p>

          <h2>6. Third-Party Links</h2>
          <p>
            The Site may include links to external services. We are not responsible for
            their content or privacy practices.
          </p>

          <h2>7. Disclaimer</h2>
          <p>
            The Site and its content are provided “as is.” We make no warranties, express or
            implied, about accuracy, reliability, or availability.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent allowed by law, Disability Traveler LLC is not liable for
            any damages arising from your use of the Site, including reliance on reviews or
            content.
          </p>

          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Disability Traveler LLC from any claims
            or losses resulting from your use of the Site or violation of these Terms.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Illinois, USA. Disputes
            will be resolved in Illinois courts.
          </p>

          <h2>11. Changes to These Terms</h2>
          <p>
            We may update these Terms periodically. The “Effective Date” above shows the
            latest version.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Email{' '}
            <strong>help@disabilitytraveler.com</strong>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
