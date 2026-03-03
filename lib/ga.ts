// app/lib/ga.ts
export function gaEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', name, params);
}
