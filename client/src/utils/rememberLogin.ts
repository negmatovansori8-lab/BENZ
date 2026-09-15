const EMAIL_KEY = 'ah_last_email';
const CODES_KEY = 'ah_saved_codes';

function readMap(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(CODES_KEY) || '{}');
    return raw && typeof raw === 'object' ? (raw as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>) {
  localStorage.setItem(CODES_KEY, JSON.stringify(map));
}

/** Normalize email or phone so lookup is stable. */
export function loginKey(raw: string) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return '';
  if (s.includes('@')) return s;
  const digits = s.replace(/\D/g, '');
  return digits || s;
}

export function lastLoginEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
}

export function savedLoginCode(emailOrPhone: string) {
  const key = loginKey(emailOrPhone);
  if (!key) return '';
  return readMap()[key] || '';
}

/** Persist the login code on this device for every identifier the user might type next time. */
export function rememberLogin(emailOrPhone: string, code: string, extraKeys: string[] = []) {
  const pin = String(code || '').trim();
  if (!pin) return;

  const keys = [loginKey(emailOrPhone), ...extraKeys.map(loginKey)].filter(Boolean);
  if (!keys.length) return;

  localStorage.setItem(EMAIL_KEY, keys[0]);
  const map = readMap();
  for (const key of keys) map[key] = pin;
  writeMap(map);
}
