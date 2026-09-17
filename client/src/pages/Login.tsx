import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { OtpBoxes, OTP_LEN } from '../components/OtpBoxes';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Header';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';
import { isAuthFlowError, mapApiAuthMessage } from '../utils/authErrors';
import { lastLoginEmail, rememberLogin } from '../utils/rememberLogin';
import type { Msg } from '../i18n/dict';
import type { RegisterPayload } from '../context/AuthContext';

const RESEND_WAIT = 60;

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
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';
  const [identifier, setIdentifier] = useState(() => lastLoginEmail());
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'ask' | 'code'>('ask');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const goAfterAuth = (role?: string) => {
    navigate(role === 'ADMIN' && from === '/' ? '/admin' : from);
  };

  const sendCode = async (idValue: string) => {
    const result = await requestPasswordReset(idValue);
    setEmail(result.email);
    setStep('code');
    setCode('');
    setCooldown(RESEND_WAIT);
  };

  const onAsk = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendCode(identifier);
      push(t('checkEmailHint'), 'success');
    } catch (err: unknown) {
      const apiKey = mapApiAuthMessage((err as { displayMessage?: string }).displayMessage);
      const message = t(apiKey || flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onCode = async (e: FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length !== OTP_LEN) {
      setError(t('codeRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await confirmPasswordReset(email, token, token);
      rememberLogin(email, token, [user.email, user.phone || '', identifier].filter(Boolean));
      push(t('welcomeBack'), 'success');
      goAfterAuth(user.role);
    } catch (err: unknown) {
      const apiKey = mapApiAuthMessage((err as { displayMessage?: string }).displayMessage);
      const message = t(apiKey || flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      await sendCode(identifier);
      push(t('checkEmailHint'), 'success');
    } catch (err: unknown) {
      const apiKey = mapApiAuthMessage((err as { displayMessage?: string }).displayMessage);
      const message = t(apiKey || flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
      <Seo title={`${t('loginTitle')} — BENZ`} />
      {step === 'ask' ? (
        <form onSubmit={onAsk} className="card w-full max-w-md space-y-3 p-8">
          <Logo className="mb-2 justify-center !text-[var(--ah-text)]" />
          <h1 className="font-display text-center text-3xl">{t('loginTitle')}</h1>
          <p className="text-center text-sm text-[var(--ah-muted)]">{t('loginCodeAutoHint')}</p>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <label>
            <span className="label">{t('emailOrPhone')}</span>
            <input
              className="input"
              type="text"
              inputMode="email"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
          <button className="btn-gold w-full" disabled={loading}>
            {loading ? t('sendingCode') : t('sendCode')}
          </button>
          <p className="text-center text-sm text-[var(--ah-muted)]">
            {t('noAccount')} <Link to="/register" className="text-gold-600">{t('navRegister')}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={onCode} className="card w-full max-w-md space-y-3 p-8">
          <h1 className="font-display text-center text-3xl">{t('checkEmailTitle')}</h1>
          <p className="text-center text-sm text-[var(--ah-muted)]">{t('checkEmailHint')}</p>
          <p className="text-center text-sm font-medium">{email || identifier}</p>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <span className="label text-center">{t('emailCode')}</span>
            <OtpBoxes value={code} onChange={setCode} disabled={loading} />
          </div>
          <button className="btn-gold w-full" disabled={loading || code.length !== OTP_LEN}>
            {loading ? t('signingIn') : t('loginTitle')}
          </button>
          <button
            type="button"
            className="w-full text-center text-sm text-gold-600 disabled:text-[var(--ah-muted)]"
            disabled={cooldown > 0 || loading}
            onClick={resend}
          >
            {cooldown > 0 ? `${t('resendIn')} ${cooldown} ${t('secondsShort')}` : t('resendCode')}
          </button>
          <p className="text-center text-sm text-[var(--ah-muted)]">
            <button type="button" className="text-gold-600" onClick={() => { setStep('ask'); setError(''); }}>
              {t('backToLogin')}
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

export function Register() {
  const { register, confirmSignup, resendSignup } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<RegisterPayload | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, password: '' };
      const result = await register(payload);
      if (result.needsConfirmation) {
        setPending(payload);
        return;
      }
      push(t('accountCreated'), 'success');
      navigate('/');
    } catch (err: unknown) {
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
            const user = await confirmSignup(pending.email, code, pending);
            const pin = code.replace(/\D/g, '');
            rememberLogin(pending.email, pin, [user.email, user.phone || '', form.phone].filter(Boolean));
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
        <p className="text-center text-sm text-[var(--ah-muted)]">{t('registerCodeHint')}</p>
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        <label><span className="label">{t('name')}</span><input className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">{t('email')}</span><input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label><span className="label">{t('phone')}</span><input className="input" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <button className="btn-gold w-full" disabled={loading}>{loading ? t('creating') : t('createAccount')}</button>
        <p className="text-center text-sm text-[var(--ah-muted)]">{t('haveAccount')} <Link to="/login" className="text-gold-600">{t('navLogin')}</Link></p>
      </form>
    </div>
  );
}
