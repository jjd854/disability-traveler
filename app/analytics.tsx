'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : '');

    // Page view
    if (window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
      window.gtag('event', 'page_view', {
        page_path: url,
      });

      // Optional: auto events for your dynamic routes
      if (pathname.startsWith('/destinations/')) {
        const slug = pathname.split('/')[2] || '';
        window.gtag('event', 'destination_view', { destination_slug: slug });
      }

      if (pathname.startsWith('/hotels/')) {
        const slug = pathname.split('/')[2] || '';
        window.gtag('event', 'hotel_view', { hotel_slug: slug });
      }
    }
  }, [pathname, searchParams]);

  return null;
}



