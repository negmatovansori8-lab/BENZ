import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Car } from '../types';
import { CarCard } from '../components/CarCard';
import { getViewedIds, avatarUrl } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';

export default function Profile() {
  const { user, refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const [tab, setTab] = useState<'listings' | 'favorites' | 'viewed' | 'settings'>('listings');
  const [listings, setListings] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [viewed, setViewed] = useState<Car[]>([]);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, phone: user.phone || '', avatar: user.avatar || '' });
    api.get('/cars/mine').then((r) => setListings(r.data.data || [])).catch(() => {});
    api.get('/favorites').then((r) => setFavorites(r.data.data || [])).catch(() => {});
    const ids = getViewedIds();
    if (ids.length) api.post('/users/viewed', { ids }).then((r) => setViewed(r.data.data || [])).catch(() => {});
  }, [user]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', form);
      await refresh();
      push(t('profileUpdated'), 'success');
    } catch (err: unknown) {
      push(t('somethingWrong'), 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="container-ah py-10">
      <Seo title={`${t('navProfile')} — BENZ`} />
      <div className="card flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
        <img src={avatarUrl(user.name, user.avatar)} alt="" className="h-24 w-24 rounded-full object-cover" />
        <div>
          <h1 className="font-display text-3xl">{user.name}</h1>
          <p className="text-sm text-[var(--ah-muted)]">{user.email} · {user.phone || '—'} · {user.role}</p>
          <p className="mt-1 text-xs text-[var(--ah-muted)]">
            {t('youAreIn')}
            {user.last_login_at ? ` · ${t('lastLogin')}: ${new Date(user.last_login_at).toLocaleString()}` : ''}
          </p>
          <div className="mt-3 flex gap-2">
            <Link to="/messages" className="btn-ghost !py-1.5">{t('navMessages')}</Link>
            <Link to="/dashboard" className="btn-ghost !py-1.5">{t('myListings')}</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { id: 'listings' as const, label: t('myListings') },
          { id: 'favorites' as const, label: t('navFavorites') },
          { id: 'viewed' as const, label: t('recentlyViewed') },
          { id: 'settings' as const, label: t('settings') },
        ]).map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`chip ${tab === item.id ? 'bg-gold-500 text-zinc-950' : ''}`}>{item.label}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'listings' && <Grid cars={listings} empty={t('noListingsYet')} />}
        {tab === 'favorites' && <Grid cars={favorites} empty={t('noFavoritesYet')} />}
        {tab === 'viewed' && <Grid cars={viewed} empty={t('notViewedYet')} />}
        {tab === 'settings' && (
          <form onSubmit={save} className="card max-w-lg space-y-3 p-6">
            <label><span className="label">{t('name')}</span><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label><span className="label">{t('phone')}</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label><span className="label">{t('avatarUrl')}</span><input className="input" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></label>
            <p className="text-xs text-[var(--ah-muted)]">{t('emailLocked')}: {user.email}</p>
            <button className="btn-gold" type="submit">{t('saveSettings')}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Grid({ cars, empty }: { cars: Car[]; empty: string }) {
  if (!cars.length) return <p className="text-sm text-[var(--ah-muted)]">{empty}</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((c) => <CarCard key={c.id} car={c} />)}
    </div>
  );
}
