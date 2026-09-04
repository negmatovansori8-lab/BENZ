import { useEffect } from 'react';
import { BRAND, BRAND_TAGLINE } from '../brand';

export function Seo({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;
    const desc = description || `${BRAND} — ${BRAND_TAGLINE}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, [title, description]);
  return null;
}
