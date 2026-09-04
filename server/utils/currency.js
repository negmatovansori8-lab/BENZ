/**
 * Exchange-rate service.
 * Swap `fetchLiveRates` for a real provider later without changing callers.
 */

const FALLBACK = {
  USD: 1,
  TJS: Number(process.env.FX_USD_TJS || 10.92),
  EUR: Number(process.env.FX_USD_EUR || 0.92),
  RUB: Number(process.env.FX_USD_RUB || 91.5),
};

let cached = { ...FALLBACK, updatedAt: new Date().toISOString(), source: 'env' };

export function getRates() {
  return cached;
}

export function convert(amountUsd, toCurrency = 'USD') {
  const code = String(toCurrency).toUpperCase();
  const rate = cached[code] ?? 1;
  return Number((Number(amountUsd) * rate).toFixed(2));
}

export async function fetchLiveRates() {
  const url = process.env.FX_API_URL;
  if (!url) return cached;
  try {
    const res = await fetch(url, {
      headers: process.env.FX_API_KEY ? { Authorization: `Bearer ${process.env.FX_API_KEY}` } : {},
    });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = await res.json();
    const rates = data.rates || data;
    cached = {
      USD: 1,
      TJS: Number(rates.TJS ?? FALLBACK.TJS),
      EUR: Number(rates.EUR ?? FALLBACK.EUR),
      RUB: Number(rates.RUB ?? FALLBACK.RUB),
      updatedAt: new Date().toISOString(),
      source: 'api',
    };
  } catch (err) {
    console.warn('FX live fetch failed, using fallback:', err.message);
  }
  return cached;
}
