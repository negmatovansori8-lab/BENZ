import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { OtpBoxes, OTP_LEN } from '../components/OtpBoxes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';
import { isAuthFlowError } from '../utils/authErrors';
import { rememberLogin } from '../utils/rememberLogin';
import type { Msg } from '../i18n/dict';

const RESEND_WAIT = 60;

function flowMessage(err: unknown, fallback: Msg): Msg {
  return isAuthFlowError(err) ? err.i18nKey : fallback;
}

export default function ForgotPassword() {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'ask' | 'code'>('ask');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

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
    } catch (err: unknown) {
      const message = t(flowMessage(err, 'somethingWrong'));
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
      await confirmPasswordReset(email, token, token);
      rememberLogin(email, token);
      push(t('passwordChanged'), 'success');
      navigate('/');
    } catch (err: unknown) {
      const message = t(flowMessage(err, 'somethingWrong'));
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
    } catch (err: unknown) {
      const message = t(flowMessage(err, 'somethingWrong'));
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-ah flex min-h-[70vh] items-center justify-center py-16">
      <Seo title={`${t('forgotPasswordTitle')} — BENZ`} />
      {step === 'ask' ? (
        <form onSubmit={onAsk} className="card w-full max-w-md space-y-3 p-8">
          <h1 className="font-display text-center text-3xl">{t('forgotPasswordTitle')}</h1>
          <p className="text-center text-sm text-[var(--ah-muted)]">{t('forgotPasswordHint')}</p>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <label>
            <span className="label">{t('emailOrPhone')}</span>
            <input
              className="input"
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
            <Link to="/login" className="text-gold-600">{t('backToLogin')}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={onCode} className="card w-full max-w-md space-y-3 p-8">
          <h1 className="font-display text-center text-3xl">{t('forgotPasswordTitle')}</h1>
          <p className="text-center text-sm text-[var(--ah-muted)]">{t('resetCodeHint')}</p>
          <p className="text-center text-sm font-medium">{email || identifier}</p>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <span className="label text-center">{t('emailCode')}</span>
            <OtpBoxes value={code} onChange={setCode} disabled={loading} />
          </div>
          <button className="btn-gold w-full" disabled={loading || code.length !== OTP_LEN}>
            {loading ? t('confirmingEmail') : t('confirmEmail')}
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
            <Link to="/login" className="text-gold-600">{t('backToLogin')}</Link>
          </p>
        </form>
      )}
    </div>
  );
}
