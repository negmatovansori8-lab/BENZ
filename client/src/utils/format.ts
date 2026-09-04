import type { Currency } from '../types';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function formatMileage(km: number) {
  return `${formatNumber(km)} km`;
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'USD',
  TJS: 'SM',
  EUR: 'EUR',
  RUB: 'RUB',
};

export function formatPrice(usd: number | string, currency: Currency, rates: Record<string, number>) {
  const amount = Number(usd) * (rates[currency] || 1);
  const symbols: Record<Currency, string> = { USD: '$', TJS: 'SM ', EUR: '€', RUB: '₽' };
  if (currency === 'USD' || currency === 'EUR') {
    return `${symbols[currency]}${formatNumber(amount)}`;
  }
  return `${formatNumber(amount)} ${symbols[currency]}`.trim();
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

const LOCAL_COUNT = 8;

function hashSeed(s: string | number) {
  const str = String(s);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function localCarSrc(seed?: string | number | null, index = 0) {
  const n = (hashSeed(seed ?? 'car') + index) % LOCAL_COUNT;
  return `/cars/${n + 1}.jpg`;
}

function parseImageList(images: unknown): unknown[] {
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(images) ? images : [];
}

function pickUrl(item: unknown): string | null {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const rec = item as { url?: string; src?: string };
    return rec.url || rec.src || null;
  }
  return null;
}

export function apiOrigin() {
  return String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '').replace(/\/api$/, '');
}

export function mediaUrl(url: string) {
  if (url.startsWith('/uploads/')) {
    const origin = apiOrigin();
    return origin ? `${origin}${url}` : url;
  }
  return url;
}

export function isLocalMedia(url: string) {
  return (
    url.startsWith('/cars/') ||
    url.startsWith('/trucks/') ||
    url.startsWith('/kamaz/') ||
    url.startsWith('/parts/') ||
    url.startsWith('/homes/') ||
    url === '/hero.jpg' ||
    url.startsWith('/uploads/') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  );
}

export function carImage(url?: string | null, seed?: string | number | null, index = 0) {
  if (url && isLocalMedia(url)) return mediaUrl(url);
  return localCarSrc(seed ?? url, index);
}

export function coverImage(images: unknown, seed?: string | number | null, index = 0) {
  const list = parseImageList(images);
  const url = pickUrl(list[index] ?? list[0]);
  return carImage(url, seed, index);
}

export function galleryImages(images: unknown, seed?: string | number | null) {
  const list = parseImageList(images);
  if (!list.length) return [localCarSrc(seed, 0), localCarSrc(seed, 1), localCarSrc(seed, 2)];
  return list.map((item, i) => carImage(pickUrl(item), seed, i));
}

export function avatarUrl(name?: string | null, url?: string | null) {
  if (url && isLocalMedia(url) && !url.startsWith('/cars/')) return mediaUrl(url);
  const letters = (name || 'AH')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase() || 'AH';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="32" fill="#c9a227"/>
    <text x="32" y="38" text-anchor="middle" font-size="20" font-family="Outfit,Arial,sans-serif" font-weight="700" fill="#0a0a0b">${letters}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function trackViewed(id: number) {
  try {
    const raw = JSON.parse(localStorage.getItem('ah_viewed') || '[]') as number[];
    const next = [id, ...raw.filter((x) => x !== id)].slice(0, 12);
    localStorage.setItem('ah_viewed', JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getViewedIds() {
  try {
    return JSON.parse(localStorage.getItem('ah_viewed') || '[]') as number[];
  } catch {
    return [];
  }
}
