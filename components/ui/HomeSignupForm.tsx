'use client';

import { useState } from 'react';
import { gaEvent } from '@/lib/ga';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  enterprise?: {
    ready: (cb: () => void) => void;
    execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  };
};

type WindowWithGrecaptcha = Window & {
  grecaptcha?: Grecaptcha;
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
  await loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);
  const g = (window as WindowWithGrecaptcha).grecaptcha;
  if (!g) throw new Error('reCAPTCHA not available.');
  return g;
}

async function getRecaptchaToken(action: string, siteKey: string): Promise<string> {
  const g = await ensureGrecaptcha(siteKey);
  return new Promise((resolve, reject) => {
    g.ready(() => {
      g.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}

export default function HomeSignupForm() {
  const [formRenderAt] = useState(() => Date.now());
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const elapsed = Date.now() - formRenderAt;
    if (elapsed < 2500) {
      setMessage('Please Try Again');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const hp = (formData.get('website') || '').toString().trim();
    if (hp.length > 0) {
      setMessage('Thanks for subscribing!');
      return;
    }

    const cleanedEmail = email.trim();
    if (!cleanedEmail) return;

    setLoading(true);
    setMessage('');

    try {
      const token = await getRecaptchaToken('subscribe', SITE_KEY);

      gaEvent('newsletter_subscribe_attempt', { location: 'homepage' });

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanedEmail, token }),
      });

      if (!res.ok) throw new Error('Subscribe failed');

      setEmail('');
      setMessage('Thanks for subscribing!');
      gaEvent('newsletter_subscribe_success', { location: 'homepage' });
    } catch {
      setMessage('Something went wrong. Please try again.');
      gaEvent('newsletter_subscribe_failed', { location: 'homepage' });
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <input
        name="website"
        type="text"
        className="visuallyHidden"
        aria-hidden="true"
      />

      <button type="submit" className="subscribeButton" disabled={loading}>
        {loading ? 'Submitting…' : 'Subscribe'}
      </button>

      {message && <p className="signupMessage">{message}</p>}
    </form>
  );
}