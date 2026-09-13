import type { Msg } from '../i18n/dict';

export type AuthFlowError = Error & {
  i18nKey: Msg;
  needsConfirmation?: boolean;
  email?: string;
};

export function isAuthFlowError(err: unknown): err is AuthFlowError {
  return Boolean(err && typeof err === 'object' && 'i18nKey' in err);
}

export function authError(key: Msg, extra?: { needsConfirmation?: boolean; email?: string }): AuthFlowError {
  const err = new Error(key) as AuthFlowError;
  err.i18nKey = key;
  if (extra?.needsConfirmation) err.needsConfirmation = true;
  if (extra?.email) err.email = extra.email;
  return err;
}

export function errorText(err: unknown): string {
  if (!err || typeof err !== 'object') return String(err || '');
  const rec = err as {
    message?: string;
    displayMessage?: string;
    code?: string;
    response?: { data?: { message?: string } };
  };
  return [rec.displayMessage, rec.response?.data?.message, rec.message, rec.code].filter(Boolean).join(' ');
}

export function isUnverifiedText(text?: string) {
  const message = String(text || '').toLowerCase();
  return (
    message.includes('email not confirmed') ||
    message.includes('not confirmed') ||
    message.includes('has not been verified') ||
    message.includes('not been verified') ||
    message.includes('verification link') ||
    message.includes('email_not_confirmed')
  );
}

export function isUnconfirmedAuthError(error: { code?: string; message?: string } | null | undefined) {
  const code = String(error?.code || '').toLowerCase();
  return code === 'email_not_confirmed' || isUnverifiedText(`${code} ${error?.message || ''}`);
}

export function needsEmailConfirmation(err: unknown) {
  if (isAuthFlowError(err) && (err.needsConfirmation || err.i18nKey === 'authEmailNotConfirmed')) return true;
  return isUnverifiedText(errorText(err));
}

export function toastErrorKey(err: unknown): Msg {
  if (isAuthFlowError(err)) return err.i18nKey;
  return mapApiAuthMessage(errorText(err)) || 'somethingWrong';
}

export function mapApiAuthMessage(message?: string): Msg | null {
  const text = String(message || '').toLowerCase();
  if (!text) return null;
  if (isUnverifiedText(text)) return 'authEmailNotConfirmed';
  if (text.includes('already exists')) return 'authEmailTaken';
  if (text.includes('invalid email or password')) return 'authBadCredentials';
  if (text.includes('blocked')) return 'authBlocked';
  if (text.includes('cannot reach') || text.includes('network')) return 'somethingWrong';
  return null;
}

export function mapSupabaseAuthError(error: { code?: string; message?: string } | null | undefined): Msg {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  if (code === 'otp_expired' || (message.includes('expired') && (message.includes('otp') || message.includes('token') || message.includes('code')))) {
    return 'authCodeExpired';
  }
  if (
    code === 'otp_disabled' ||
    ((message.includes('invalid') || message.includes('token')) && (message.includes('otp') || message.includes('token') || message.includes('code')))
  ) {
    return 'authCodeInvalid';
  }
  if (code === 'email_exists' || code === 'user_already_exists' || message.includes('already registered') || message.includes('already exists')) {
    return 'authEmailTaken';
  }
  if (code === 'over_email_send_rate_limit' || message.includes('security purposes') || message.includes('rate limit') || message.includes('only request this after')) {
    return 'authTooMany';
  }
  if (code === 'weak_password' || (message.includes('password') && (message.includes('weak') || message.includes('at least') || message.includes('characters')))) {
    return 'authWeakPassword';
  }
  if (isUnconfirmedAuthError(error)) return 'authEmailNotConfirmed';
  if (code === 'validation_failed' || (message.includes('invalid') && message.includes('email'))) {
    return 'authInvalidEmail';
  }
  if (code === 'signup_disabled') return 'authNotConfigured';
  return 'somethingWrong';
}
