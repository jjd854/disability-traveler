// app/layout.tsx
import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Analytics from './analytics';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Disability Traveler',
  description: 'Accessible travel reviews and destinations',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#3eaf6f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-ZRBT8GV9H8';

  return (
    <html lang="en">
      <head>
        {/* Fallback: explicitly add manifest link (harmless if metadata already injects it) */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Google Analytics (only in production) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* reCAPTCHA */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="app-shell">
          {children}
        </div>
        {process.env.NODE_ENV === 'production' && (
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
        )}
      </body>
    </html>
  );
}
