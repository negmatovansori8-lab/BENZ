import { createPublicKey, verify } from 'crypto';

const FALLBACK_URL = 'https://menlkzkztmfcelxeqgma.supabase.co';

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_URL).replace(/\/$/, '');
}

function supabaseAnonKey() {
  return String(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
}

function b64urlToBuf(value) {
  const pad = '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

async function emailFromJwks(accessToken) {
  const parts = String(accessToken || '').split('.');
  if (parts.length !== 3) return null;
  let header;
  let payload;
  try {
    header = JSON.parse(b64urlToBuf(parts[0]).toString());
    payload = JSON.parse(b64urlToBuf(parts[1]).toString());
  } catch {
    return null;
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  const res = await fetch(`${supabaseUrl()}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) return null;
  const { keys = [] } = await res.json();
  const jwk = keys.find((k) => k.kid === header.kid) || keys[0];
  if (!jwk) return null;
  const key = createPublicKey({ key: jwk, format: 'jwk' });
  const data = Buffer.from(`${parts[0]}.${parts[1]}`);
  const sig = b64urlToBuf(parts[2]);
  const ok = verify('sha256', data, key, sig);
  if (!ok) return null;
  return String(payload.email || '').toLowerCase() || null;
}

export async function emailFromSupabaseAccessToken(accessToken) {
  if (!accessToken) return null;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const key = supabaseAnonKey();
  if (key) headers.apikey = key;
  try {
    const res = await fetch(`${supabaseUrl()}/auth/v1/user`, { headers });
    if (res.ok) {
      const user = await res.json();
      return String(user.email || '').toLowerCase() || null;
    }
  } catch {
    /* JWKS fallback */
  }
  try {
    return await emailFromJwks(accessToken);
  } catch {
    return null;
  }
}

export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function phoneLookupVariants(value) {
  const d = phoneDigits(value);
  if (d.length < 9) return [];
  const variants = new Set([d]);
  // +992XXXXXXXXX
  if (d.startsWith('992') && d.length >= 12) {
    variants.add(d.slice(3));
    variants.add(d.slice(-9));
  }
  // 0XXXXXXXXX local
  if (d.startsWith('0') && d.length >= 10) {
    const local = d.slice(1);
    variants.add(local);
    variants.add(`992${local}`);
  }
  // 9-digit Tajik mobile (90/91/92/93/98/110…)
  if (!d.startsWith('992') && d.length === 9) {
    variants.add(`992${d}`);
  }
  // 10-digit with leading 0 already handled; without 992
  if (!d.startsWith('992') && d.length === 10 && !d.startsWith('0')) {
    variants.add(`992${d.slice(-9)}`);
    variants.add(d.slice(-9));
  }
  if (d.length > 12) variants.add(d.slice(-9));
  return [...variants];
}
