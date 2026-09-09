import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, Car, Heart, Home, Menu, MessageSquare, Moon, Sun, User, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { LOCALES, useI18n } from '../context/LocaleContext';
import { api } from '../services/api';
import type { Currency, NotificationItem } from '../types';
import { CURRENCIES } from '../types';
import { avatarUrl, timeAgo } from '../utils/format';
import { cn, CURRENCY_LABELS } from '../utils/format';

const navKeys = [
  { to: '/', key: 'navHome' as const },
  { to: '/cars', key: 'navCars' as const },
  { to: '/cars?category=heavy', key: 'catCommercial' as const },
  { to: '/homes', key: 'catHomes' as const },
  { to: '/sell', key: 'navSell' as const },
  { to: '/compare', key: 'navCompare' as const },
];

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link viewTransition to="/" className={cn('flex items-center gap-2', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-zinc-950 shadow-glow">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          <path d="M6 20h20l-2.2-6.2A3 3 0 0 0 21 12H11a3 3 0 0 0-2.8 1.8L6 20z" fill="currentColor" />
          <circle cx="10" cy="21.5" r="2" fill="#0a0a0b" />
          <circle cx="22" cy="21.5" r="2" fill="#0a0a0b" />
        </svg>
      </span>
      <span className="font-display text-xl tracking-[0.18em]">
        BEN<span className="text-gold-500">Z</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { items } = useCompare();
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [bell, setBell] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then((r) => setNotes(r.data.data || [])).catch(() => {});
  }, [user]);

  const unread = notes.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-50 glass text-white">
      <div className="container-ah flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navKeys.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              viewTransition
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white',
                  isActive && 'bg-white/10 text-gold-300'
                )
              }
            >
              {t(l.key)}
              {l.to === '/compare' && items.length > 0 && (
                <span className="ml-1 text-gold-400">({items.length})</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <select
            aria-label={t('language')}
            className="notranslate hidden rounded-full border border-white/10 bg-transparent px-2 py-1 text-xs text-white/80 sm:block"
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
          >
            {LOCALES.map((l) => (
              <option key={l.id} value={l.id} className="text-zinc-900">
                {l.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Currency"
            translate="no"
            className="notranslate hidden rounded-full border border-white/10 bg-transparent px-2 py-1 text-xs text-white/80 md:block"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} className="text-zinc-900" translate="no">
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
          <button type="button" className="rounded-full p-2 text-white/80 hover:bg-white/10" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user && (
            <div className="relative">
              <button type="button" className="relative rounded-full p-2 text-white/80 hover:bg-white/10" onClick={() => setBell((v) => !v)}>
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-400" />
                )}
              </button>
              {bell && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--ah-line)] bg-[var(--ah-surface)] text-[var(--ah-text)] shadow-card">
                  <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
                    {t('notifications')}
                    <button
                      type="button"
                      className="text-xs text-gold-600"
                      onClick={() => api.post('/notifications/read-all').then(() => setNotes((n) => n.map((x) => ({ ...x, is_read: true }))))}
                    >
                      {t('markAllRead')}
                    </button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notes.length === 0 && <p className="px-4 py-6 text-sm text-[var(--ah-muted)]">{t('noNotifications')}</p>}
                    {notes.slice(0, 8).map((n) => (
                      <div key={n.id} className={cn('border-t border-[var(--ah-line)] px-4 py-3 text-sm', !n.is_read && 'bg-gold-500/5')}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-[var(--ah-muted)]">{n.body}</p>
                        <p className="mt-1 text-[10px] text-[var(--ah-muted)]">{timeAgo(n.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300">
                  {t('navAdmin')}
                </Link>
              )}
              <Link to="/profile" title={`${t('youAreIn')}: ${user.email}`} className="flex items-center gap-2 rounded-full border border-white/10 px-2 py-0.5 text-xs text-white">
                <span className="relative">
                  <img src={avatarUrl(user.name, user.avatar)} alt="" className="h-6 w-6 rounded-full bg-white/10 object-cover" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
                </span>
                <span className="hidden max-w-[160px] truncate md:inline">{user.name}</span>
              </Link>
              <button type="button" className="text-xs text-white/60 hover:text-white" onClick={() => { logout(); navigate('/'); }}>
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost !py-1.5 !text-white">{t('navLogin')}</Link>
              <Link to="/register" className="btn-gold !py-1.5">{t('navRegister')}</Link>
            </div>
          )}
          <button type="button" className="rounded-full p-2 text-white lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,360px)] bg-zinc-950 p-6 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)}><X /></button>
            </div>
            <label className="mb-3 flex items-center justify-between text-sm text-white/70">
              {t('language')}
              <select
                className="rounded-full border border-white/10 bg-transparent px-2 py-1 text-xs text-white"
                value={locale}
                onChange={(e) => setLocale(e.target.value as typeof locale)}
              >
                {LOCALES.map((l) => (
                  <option key={l.id} value={l.id} className="text-zinc-900">
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mb-4 flex items-center justify-between text-sm text-white/70">
              Currency
              <select
                translate="no"
                className="notranslate rounded-full border border-white/10 bg-transparent px-2 py-1 text-xs text-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="text-zinc-900" translate="no">
                    {CURRENCY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2">
              {navKeys.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-white/10">
                  {t(l.key)}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-white/10">{t('navProfile')}</Link>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-white/10">{t('navDashboard')}</Link>
                  {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-gold-400">{t('navAdmin')}</Link>}
                  <button type="button" className="rounded-xl px-3 py-2 text-left text-red-300" onClick={() => { logout(); setOpen(false); }}>{t('navLogout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">{t('navLogin')}</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-gold mt-2">{t('navRegister')}</Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useI18n();
  const items = [
    { to: '/', icon: Home, label: t('navHome') },
    { to: '/cars', icon: Car, label: t('mobileCars') },
    { to: '/favorites', icon: Heart, label: t('navFavorites') },
    { to: '/messages', icon: MessageSquare, label: t('navMessages') },
    { to: user ? '/profile' : '/login', icon: User, label: t('navProfile') },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--ah-line)] bg-[var(--ah-surface)]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.label}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                cn('flex min-h-[48px] flex-col items-center justify-center gap-0.5 py-1.5 text-[10px]', isActive ? 'text-gold-500' : 'text-[var(--ah-muted)]')
              }
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-10 border-t border-[var(--ah-line)] bg-zinc-950 text-white sm:mt-16">
      <div className="container-ah grid gap-8 py-10 md:grid-cols-4 md:gap-10 md:py-14">
        <div>
          <Logo />
          <p className="mt-3 font-display text-lg text-gold-400">{t('slogan')}</p>
          <p className="mt-2 text-sm text-white/60">{t('footerAbout')}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">{t('explore')}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/cars">{t('navCars')}</Link></li>
            <li><Link to="/cars?category=heavy">{t('catCommercial')}</Link></li>
            <li><Link to="/homes">{t('catHomes')}</Link></li>
            <li><Link to="/sell">{t('navSell')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">{t('account')}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/login">{t('navLogin')}</Link></li>
            <li><Link to="/register">{t('navRegister')}</Link></li>
            <li><Link to="/dashboard">{t('navDashboard')}</Link></li>
            <li><Link to="/messages">{t('navMessages')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">{t('brands')}</h3>
          <p className="text-sm text-white/70">BMW · Mercedes · Toyota · Lexus · Audi · Tesla · Porsche · Hyundai · Kia · Honda</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} BENZ. {t('rights')}
      </div>
    </footer>
  );
}

