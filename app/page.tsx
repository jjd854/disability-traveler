'use client';

import Link from 'next/link';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import './globals.css';
import { useEffect, useRef, useState } from 'react';
import { gaEvent } from '@/lib/ga';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

/** ---- small helpers to load + normalize grecaptcha ---- **/
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  enterprise?: {
    ready: (cb: () => void) => void;
    execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  };
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureGrecaptcha(siteKey: string): Promise<Grecaptcha> {
  // Try pure v3 first
  try {
    await loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);
  } catch {
    /* ignore; we’ll try enterprise next */
  }

  let g: Grecaptcha | undefined = (window as any).grecaptcha;
  let hasClient =
    !!g &&
    (typeof g.execute === 'function' ||
      (g.enterprise && typeof g.enterprise.execute === 'function'));

  if (!hasClient) {
    // Some keys/pages only work with enterprise shim; load it if needed
    await loadScript(`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`);
    g = (window as any).grecaptcha;
    hasClient =
      !!g &&
      (typeof g.execute === 'function' ||
        (g.enterprise && typeof g.enterprise.execute === 'function'));
  }

  if (!hasClient || !g) throw new Error('reCAPTCHA not available.');
  return g;
}

async function getRecaptchaToken(action: string, siteKey: string): Promise<string> {
  const g = await ensureGrecaptcha(siteKey);
  const api = g.enterprise && typeof g.enterprise.execute === 'function' ? g.enterprise : g;

  return new Promise<string>((resolve, reject) => {
    try {
      api.ready(() => {
        api
          .execute(siteKey, { action })
          .then((t: string) => resolve(t))
          .catch(reject);
      });
    } catch (err) {
      reject(err);
    }
  });
}
/** ------------------------------------------------------ **/

export default function HomePage() {
  const [formRenderAt] = useState<number>(() => Date.now());
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const primed = useRef(false);

  // Prime the script on page load so execute is snappy on click
  useEffect(() => {
    if (primed.current || !SITE_KEY) return;
    primed.current = true;
    ensureGrecaptcha(SITE_KEY).catch(() => {
      // ignore: we’ll retry in handleSubmit
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  // Human timing check — minimum 2.5 seconds from form render
  const elapsed = Date.now() - formRenderAt;
  if (elapsed < 2500) {
    setMessage('Please Try Again');
    return;
  }

  // Honeypot check
  const formData = new FormData(e.currentTarget as HTMLFormElement);
  const hp = (formData.get('website') || '').toString().trim();
  if (hp.length > 0) {
    // Bot detected — pretend success and stop
    setMessage('Thanks for subscribing!');
    return;
  }

  const cleanedEmail = email.trim();
  if (!cleanedEmail) return;

  setLoading(true);
  setMessage('');

  try {
    if (!SITE_KEY) throw new Error('Missing site key.');

    // 1) Get v3 token
    const token = await getRecaptchaToken('subscribe', SITE_KEY);
    if (!token) {
      setMessage("Spam protection didn't load. Please refresh and try again.");
      return;
    }

    console.log("Submitting:", { email: cleanedEmail, token: token?.slice(0, 12) });
    
    gaEvent('newsletter_subscribe_attempt', {
      location: 'homepage',
    });


    // 2) Send to your API for server-side verification + Brevo
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanedEmail, token }),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : null;

    if (!res.ok) throw new Error(data?.error || 'Subscribe failed.');

    setEmail('');
    setMessage('Thanks for subscribing!');
    gaEvent('newsletter_subscribe_success', {
      location: 'homepage',
    });
  } catch (err: any) {

    gaEvent('newsletter_subscribe_failed', {
      location: 'homepage',
    });
    
    const msg = String(err?.message || '').toLowerCase();

    if (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('recaptcha') ||
      msg.includes('could not connect')
    ) {
      setMessage("Couldn't connect right now. Please check your internet connection and try again.");
    } else {
      setMessage('Something went wrong. Please try again.');
    }
  }
    finally {
    setLoading(false);
  }
};


  return (
    <>
      <Navbar />

      <section className="hero">
        <h1>Plan Accessible Travel with Confidence</h1>
        <p>Real accessibility insights for travelers with disabilities</p>
        <div className="hero-buttons">
          <Link href="/destinations"><button>Explore Destinations</button></Link>
          <Link href="/hotels"><button>Browse Hotels</button></Link>
          <Link href="/submit-review"><button>Submit a Review</button></Link>
        </div>
      </section>

      <section className="newsletterSection">
        <h2 className="sectionTitle">Stay in the Loop</h2>
        <p className="sectionSubtitle">
          Disability Traveler will send occasional emails with accessible travel updates. Unsubscribe anytime. 
        </p>

        <form className="emailSignupForm" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="emailInput"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Honeypot field — hidden from humans */}
          <label className="visuallyHidden" htmlFor="website">
            If you are a human, leave this field blank
          </label>
          <input
            id="website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            className="visuallyHidden"
            aria-hidden="true"
          />
          <button type="submit" className="subscribeButton" disabled={loading}>
            {loading ? 'Submitting…' : 'Subscribe'}
          </button>
          {message && <p className="signupMessage">{message}</p>}
        </form>
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

