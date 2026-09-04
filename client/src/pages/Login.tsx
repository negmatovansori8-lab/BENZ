import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Header';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      push(t('welcomeBack'), 'success');
      navigate(user.role === 'ADMIN' && from === '/' ? '/admin' : from);
    } catch (err: unknown) {
      push((err as { displayMessage?: string }).displayMessage || t('tryAgain'), 'error');
    } finally {
      setLoading(false);
    }
  };

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
          Demo admin: <b>admin@autohub.tj</b> / Admin123!
        </p>
      </form>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      push(t('accountCreated'), 'success');
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { displayMessage?: string }).displayMessage || t('somethingWrong');
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

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
