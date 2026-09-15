/** Temporary / throwaway inbox domains — registration blocked. */
const DISPOSABLE = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.net',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tmpmail.org',
  'tmpmail.net',
  '10minutemail.com',
  '10minutemail.net',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.me',
  'getnada.com',
  'nada.email',
  'maildrop.cc',
  'dispostable.com',
  'mailnesia.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'throwaway.email',
  'moakt.com',
  'emailondeck.com',
  'mintemail.com',
  'mytemp.email',
  'tempail.com',
  'tempr.email',
  'discard.email',
  'mailcatch.com',
  'inboxkitten.com',
  'getairmail.com',
  'spamgourmet.com',
  'mailnull.com',
  'mailforspam.com',
  'trash-mail.com',
  'wegwerfmail.de',
  'bye-bye-email.com',
]);

/** Common misspellings that bounce (not real providers). */
const TYPO_DOMAINS = new Set([
  'gamil.com',
  'gmial.com',
  'gnail.com',
  'gmai.com',
  'gmail.co',
  'gmail.con',
  'gmail.cm',
  'hotmial.com',
  'hotmal.com',
  'outlok.com',
  'outllok.com',
  'yaho.com',
  'yahho.com',
]);

export function emailDomain(email) {
  const at = String(email || '').toLowerCase().trim().lastIndexOf('@');
  if (at < 0) return '';
  return String(email).toLowerCase().trim().slice(at + 1);
}

export function assertRealEmail(email) {
  const domain = emailDomain(email);
  if (!domain || !domain.includes('.')) {
    const err = new Error('Use a real email address');
    err.statusCode = 400;
    throw err;
  }
  if (DISPOSABLE.has(domain) || TYPO_DOMAINS.has(domain)) {
    const err = new Error('Use a real email address, not a temporary or fake one');
    err.statusCode = 400;
    throw err;
  }
}
