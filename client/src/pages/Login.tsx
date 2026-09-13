import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Header';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';
import { isAuthFlowError, mapApiAuthMessage, needsEmailConfirmation } from '../utils/authErrors';
import type { Msg } from '../i18n/dict';
import type { RegisterPayload } from '../context/AuthContext';

const RESEND_WAIT = 60;
const OTP_LEN = 6;

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LEN }, (_, i) => value[i] || '');

  const focusAt = (i: number) => {
    refs.current[Math.max(0, Math.min(OTP_LEN - 1, i))]?.focus();
  };

  const setDigits = (next: string[], focus?: number) => {
    onChange(next.join('').replace(/\D/g, '').slice(0, OTP_LEN));
    if (focus != null) focusAt(focus);
  };

  return (
    <div className="flex justify-center gap-2" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="h-12 w-11 rounded-xl border border-[var(--ah-line)] bg-[var(--ah-surface)] text-center font-display text-xl outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 sm:h-14 sm:w-12"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={i === 0}
          maxLength={1}
          disabled={disabled}
          value={d}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            if (!raw) {
              const next = [...digits];
              next[i] = '';
              setDigits(next, i);
              return;
            }
            if (raw.length > 1) {
              const pasted = raw.slice(0, OTP_LEN).split('');
              const next = Array.from({ length: OTP_LEN }, (_, idx) => pasted[idx] || '');
              setDigits(next, Math.min(pasted.length, OTP_LEN - 1));
              return;
            }
            const next = [...digits];
            next[i] = raw;
            setDigits(next, i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault();
              const next = [...digits];
              if (next[i]) {
                next[i] = '';
                setDigits(next, i);
              } else {
                next[i - 1] = '';
                setDigits(next, i - 1);
              }
            }
            if (e.key === 'ArrowLeft') focusAt(i - 1);
            if (e.key === 'ArrowRight') focusAt(i + 1);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
            if (!pasted) return;
            e.preventDefault();
            const next = Array.from({ length: OTP_LEN }, (_, idx) => pasted[idx] || '');
            setDigits(next, Math.min(pasted.length, OTP_LEN - 1));
          }}
        />
      ))}
    </div>
  );
}

function flowMessage(err: unknown, fallback: Msg): Msg {
  return isAuthFlowError(err) ? err.i18nKey : fallback;
}

function EmailConfirmPanel({
  email,
  onConfirm,
  onResend,
}: {
  email: string;
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}) {
  const { t } = useI18n();
  const { push } = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_WAIT);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length !== OTP_LEN) {
      setError(t('codeRequired'));
      return;
    }
    setError('');
    setConfirming(true);
    try {
      await onConfirm(token);
    } catch (err: unknown) {
      const message = t(flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setConfirming(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await onResend();
      setCooldown(RESEND_WAIT);
    } catch (err: unknown) {
      const message = t(flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} className="card w-full max-w-md space-y-3 p-8">
      <h1 className="font-display text-center text-3xl">{t('checkEmailTitle')}</h1>
      <p className="text-center text-sm text-[var(--ah-muted)]">{t('checkEmailHint')}</p>
      <p className="text-center text-sm font-medium">{email}</p>
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      <div>
        <span className="label text-center">{t('emailCode')}</span>
        <OtpBoxes value={code} onChange={setCode} disabled={confirming} />
      </div>
      <button className="btn-gold w-full" disabled={confirming || code.length !== OTP_LEN}>
        {confirming ? t('confirmingEmail') : t('confirmEmail')}
      </button>
      <button
        type="button"
        className="w-full text-center text-sm text-gold-600 disabled:text-[var(--ah-muted)]"
        disabled={cooldown > 0 || resending}
        onClick={resend}
      >
        {cooldown > 0 ? `${t('resendIn')} ${cooldown} ${t('secondsShort')}` : t('resendCode')}
      </button>
    </form>
  );
}

export default function Login() {
  const { login, confirmSignup, resendSignup } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<RegisterPayload | null>(null);

  const goAfterAuth = (role?: string) => {
    navigate(role === 'ADMIN' && from === '/' ? '/admin' : from);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      push(t('welcomeBack'), 'success');
      goAfterAuth(user.role);
    } catch (err: unknown) {
      if (needsEmailConfirmation(err)) {
        setPending({
          name: email.split('@')[0],
          email: (isAuthFlowError(err) && err.email) || email,
          password,
        });
        return;
      }
      const apiKey = mapApiAuthMessage((err as { displayMessage?: string }).displayMessage);
      push(t(apiKey || flowMessage(err, 'tryAgain')), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
        <Seo title={`${t('checkEmailTitle')} — BENZ`} />
        <EmailConfirmPanel
          email={pending.email}
          onConfirm={async (code) => {
            const user = await confirmSignup(pending.email, code, pending);
            push(t('accountCreated'), 'success');
            goAfterAuth(user.role);
          }}
          onResend={() => resendSignup(pending.email)}
        />
      </div>
    );
  }

  return (
    <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
      <Seo title={`${t('loginTitle')} — BENZ`} />
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
        <Logo className="mb-6 justify-center !text-[var(--ah-text)]" />
        <h1 className="font-display text-center text-3xl">{t('loginTitle')}</h1>
        <p className="mb-6 text-center text-sm text-[var(--ah-muted)]">{t('loginWelcome')}</p>
        <label className="block"><span className="label">{t('email')}</span><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="mt-3 block"><span className="label">{t('password')}</span><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn-gold mt-6 w-full" disabled={loading}>{loading ? t('signingIn') : t('loginTitle')}</button>
        <p className="mt-4 text-center text-sm text-[var(--ah-muted)]">
          {t('noAccount')} <Link to="/register" className="text-gold-600">{t('navRegister')}</Link>
        </p>
        <p className="mt-4 rounded-xl bg-black/5 p-3 text-xs dark:bg-white/5">
          {t('demoAdmin')}: <b>admin@autohub.tj</b> / Admin123!
        </p>
      </form>
    </div>
  );
}

export function Register() {
  const { register, confirmSignup, resendSignup } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<RegisterPayload | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(form);
      if (result.needsConfirmation) {
        setPending(form);
        return;
      }
      push(t('accountCreated'), 'success');
      navigate('/');
    } catch (err: unknown) {
      if (needsEmailConfirmation(err) || (isAuthFlowError(err) && err.i18nKey === 'authEmailTaken')) {
        setPending(form);
        return;
      }
      const apiKey = mapApiAuthMessage((err as { displayMessage?: string }).displayMessage);
      const message = isAuthFlowError(err)
        ? t(err.i18nKey)
        : t(apiKey || 'somethingWrong');
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
        <Seo title={`${t('checkEmailTitle')} — BENZ`} />
        <EmailConfirmPanel
          email={pending.email}
          onConfirm={async (code) => {
            await confirmSignup(pending.email, code, pending);
            push(t('accountCreated'), 'success');
            navigate('/');
          }}
          onResend={() => resendSignup(pending.email)}
        />
      </div>
    );
  }

  return (
    <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
      <Seo title={`${t('registerTitle')} — BENZ`} />
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-3 p-8">
        <h1 className="font-display text-center text-3xl">{t('registerTitle')}</h1>
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        <label><span className="label">{t('name')}</span><input className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">{t('email')}</span><input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label><span className="label">{t('phone')}</span><input className="input" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">{t('password')}</span><input className="input" type="password" minLength={8} required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn-gold w-full" disabled={loading}>{loading ? t('creating') : t('createAccount')}</button>
        <p className="text-center text-sm text-[var(--ah-muted)]">{t('haveAccount')} <Link to="/login" className="text-gold-600">{t('navLogin')}</Link></p>
      </form>
    </div>
  );
}
