import type { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';    

export const metadata: Metadata = {
  title: 'Privacy Policy | Disability Traveler',
  description:
    'Privacy Policy for Disability Traveler LLC. Learn how we collect, use, and protect your personal information.',
};

export default function Page() {
  return (
 <>
    <Navbar />
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 20px' }}>
      <article>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          <em>Effective Date: [Insert Date Before Launch]</em>
        </p>

        <p>
          This Privacy Policy explains how <strong>Disability Traveler LLC</strong> (“we,”
          “our,” or “us”) collects, uses, and protects information when you use
          disabilitytraveler.com (the “Site”).
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Reviews:</strong> When you submit a review, we collect your name,
            email, ratings, written review, and any uploaded photos.
          </li>
          <li>
            <strong>Email Signups:</strong> We collect your email through our email
            partner, Brevo.
          </li>
          <li>
            <strong>Direct Contact:</strong> If you email us at
            help@disabilitytraveler.com, we may collect your name, email address, and
            message content.
          </li>
          <li>
            <strong>Cookies &amp; Analytics:</strong> We use tools such as Google
            Analytics to understand how visitors use our site and improve user experience.
          </li>
          <li>
            <strong>Uploaded Media:</strong> Files uploaded via Filestack are securely
            processed to display alongside reviews.
          </li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>Display reviews and photos on destination and hotel pages.</li>
          <li>Email marketing communications are sent only to users who explicitly opt in. You may unsubscribe at any time using the link included in our emails.</li>
          <li>Improve site usability and accessibility.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We share limited information with service providers such as Brevo (email),
          Filestack (media uploads), and analytics providers. We do not sell or rent your
          personal data.
        </p>

        <h2>4. Cookies and Tracking</h2>
        <p>
          Cookies help us analyze traffic and personalize content. You can control cookie
          settings in your browser. Disabling cookies may affect site functionality.
        </p>

        <h2>5. Data Retention</h2>
        <ul>
          <li>Reviews and photos: kept indefinitely unless you request deletion.</li>
          <li>Email list data: kept until you unsubscribe or request removal.</li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>
          You may request access, correction, or deletion of your data at any time by
          contacting us at <strong>help@disabilitytraveler.com</strong>.
        </p>
         <p>
          Depending on your state of residence, you may have rights to request access to, correction of, or deletion of your personal information. To exercise these rights, contact us at <strong>help@disabilitytraveler.com</strong>.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We use SSL encryption and secure third-party services to protect your data, but
          no online system is 100% secure.
        </p>

        <h2>8. Children’s Privacy</h2>
        <p>
          Our site is not directed to children under 13. We do not knowingly collect data
          from minors.
        </p>

        <h2>9. Policy Updates</h2>
        <p>
          We may update this policy occasionally. The “Effective Date” above will always
          show the most recent version.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          For privacy questions, contact: <strong>help@disabilitytraveler.com</strong>
          <br />
          Disability Traveler LLC, Illinois, USA
        </p>
      </article>
    </main>
    <Footer />
    </>
  );
}
