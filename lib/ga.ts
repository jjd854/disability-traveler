// app/lib/ga.ts
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', name, params);
}
