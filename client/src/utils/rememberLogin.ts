const EMAIL_KEY = 'ah_last_email';
const CODES_KEY = 'ah_saved_codes';

function readMap(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(CODES_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function emailKey(email: string) {
  return email.trim().toLowerCase();
}

export function lastLoginEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
}

export function savedLoginCode(email: string) {
  if (!email) return '';
  return readMap()[emailKey(email)] || '';
}

export function rememberLogin(email: string, code: string) {
  const key = emailKey(email);
  const pin = String(code || '').trim();
  if (!key || !pin) return;
  localStorage.setItem(EMAIL_KEY, key);
  const map = readMap();
  map[key] = pin;
  localStorage.setItem(CODES_KEY, JSON.stringify(map));
}
