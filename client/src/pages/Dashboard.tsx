import { Eye, Heart, Pause, Pencil, Plus, Trash2, Car as CarIcon } from '../components/icons';
import { Icon } from '../components/icons/Icon';
import { IconButton } from '../components/icons/IconButton';
import { Seo } from '../components/Seo';
import { api } from '../services/api';
import type { Car } from '../types';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { EmptyState } from '../components/EmptyState';
import { useI18n } from '../context/LocaleContext';
import { toastErrorKey } from '../utils/authErrors';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Dash {
  stats: { total: number; active: number; sold: number; pending: number; paused: number; views: number; favorites: number };
  listings: Car[];
}

export default function Dashboard() {
  const [data, setData] = useState<Dash | null>(null);
  const [tab, setTab] = useState('all');
  const { push } = useToast();
  const { t } = useI18n();
  const { currency, rates } = useCurrency();

  const load = () => api.get('/cars/dashboard').then((r) => setData(r.data));
  useEffect(() => { load().catch(() => {}); }, []);

  const act = async (path: string, method: 'post' | 'delete' = 'post') => {
    try {
      await api[method](path);
      push(t('updatedOk'), 'success');
      load();
    } catch (e: unknown) {
      push(t(toastErrorKey(e)), 'error');
    }
  };

  const list = (data?.listings || []).filter((c) => {
    if (tab === 'active') return c.status === 'APPROVED';
    if (tab === 'sold') return c.status === 'SOLD';
    if (tab === 'pending') return c.status === 'PENDING';
    return true;
  });

  const stats = [
    { label: t('myListings'), v: data?.stats.total ?? '—' },
    { label: t('activeListings'), v: data?.stats.active ?? '—' },
    { label: t('soldCars'), v: data?.stats.sold ?? '—' },
    { label: t('specViews'), v: data?.stats.views ?? '—' },
    { label: t('navFavorites'), v: data?.stats.favorites ?? '—' },
    { label: t('pendingLabel'), v: data?.stats.pending ?? '—' },
  ];

  const tabs = [
    { id: 'all', label: t('tabAll') },
    { id: 'active', label: t('tabActive') },
    { id: 'pending', label: t('tabPending') },
    { id: 'sold', label: t('tabSold') },
  ];

  return (
    <div className="container-ah py-10">
      <Seo title={`${t('dashTitle')} — BENZ`} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{t('dashTitle')}</h1>
          <p className="text-sm text-[var(--ah-muted)]">{t('dashSubtitle')}</p>
        </div>
        <Link to="/sell" className="btn-gold inline-flex items-center gap-2">
          <Icon icon={Plus} size="sm" decorative /> {t('addCar')}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--ah-muted)]">{s.label}</p>
            <p className="mt-1 font-display text-2xl">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`chip ${tab === item.id ? 'bg-gold-500 text-zinc-950' : ''}`}>{item.label}</button>
        ))}
      </div>

      {!list.length ? (
        <div className="mt-6"><EmptyState icon={CarIcon} title={t('noListings')} text={t('publishFirstCar')} action={{ to: '/sell', label: t('addCar') }} /></div>
      ) : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--ah-line)] text-xs uppercase text-[var(--ah-muted)]">
              <tr>
                <th className="p-3">{t('colCar')}</th>
                <th>{t('colPrice')}</th>
                <th>{t('colStatus')}</th>
                <th>{t('specViews')}</th>
                <th aria-label={t('navFavorites')}>
                  <Icon icon={Heart} size="xs" label={t('navFavorites')} />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-[var(--ah-line)]">
                  <td className="p-3">
                    <Link to={`/cars/${c.id}`} className="font-medium">{c.brand} {c.model} · {c.year}</Link>
                  </td>
                  <td>{formatPrice(c.price_usd, currency, rates)}</td>
                  <td><span className="chip text-[10px]">{c.status}</span></td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon icon={Eye} size="xs" decorative />
                      {c.views}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon icon={Heart} size="xs" decorative />
                      {c.favorites_count}
                    </span>
                  </td>
                  <td className="space-x-1 p-3 text-right">
                    <Link
                      to={`/sell?edit=${c.id}`}
                      className="ah-icon-btn inline-flex rounded-full p-2 text-[var(--ah-muted)] transition hover:bg-[var(--ah-muted)]/10 hover:text-[var(--ah-text)]"
                      title={t('sellEditBtn')}
                      aria-label={t('sellEditBtn')}
                    >
                      <Icon icon={Pencil} size="sm" decorative />
                    </Link>
                    {c.status !== 'SOLD' && (
                      <button type="button" className="rounded-full px-2 py-1 text-xs hover:bg-[var(--ah-muted)]/10" title={t('markSold')} onClick={() => act(`/cars/${c.id}/sold`)}>{t('markSold')}</button>
                    )}
                    {c.status !== 'SOLD' && (
                      <IconButton icon={Pause} label={t('sellEditBtn')} onClick={() => act(`/cars/${c.id}/pause`)} />
                    )}
                    <IconButton icon={Trash2} label={t('sellRemove')} tone="danger" onClick={() => act(`/cars/${c.id}`, 'delete')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
