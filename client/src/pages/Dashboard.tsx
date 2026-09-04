import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Pause, Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../components/Seo';
import { api } from '../services/api';
import type { Car } from '../types';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { EmptyState } from '../components/EmptyState';
import { Car as CarIcon } from 'lucide-react';

interface Dash {
  stats: { total: number; active: number; sold: number; pending: number; paused: number; views: number; favorites: number };
  listings: Car[];
}

export default function Dashboard() {
  const [data, setData] = useState<Dash | null>(null);
  const [tab, setTab] = useState('all');
  const { push } = useToast();
  const { currency, rates } = useCurrency();

  const load = () => api.get('/cars/dashboard').then((r) => setData(r.data));
  useEffect(() => { load().catch(() => {}); }, []);

  const act = async (path: string, method: 'post' | 'delete' = 'post') => {
    try {
      await api[method](path);
      push('Updated', 'success');
      load();
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    }
  };

  const list = (data?.listings || []).filter((c) => {
    if (tab === 'active') return c.status === 'APPROVED';
    if (tab === 'sold') return c.status === 'SOLD';
    if (tab === 'pending') return c.status === 'PENDING';
    return true;
  });

  const stats = [
    { label: 'My Listings', v: data?.stats.total ?? '—' },
    { label: 'Active Listings', v: data?.stats.active ?? '—' },
    { label: 'Sold Cars', v: data?.stats.sold ?? '—' },
    { label: 'Views', v: data?.stats.views ?? '—' },
    { label: 'Favorites', v: data?.stats.favorites ?? '—' },
    { label: 'Pending', v: data?.stats.pending ?? '—' },
  ];

  return (
    <div className="container-ah py-10">
      <Seo title="Seller Dashboard — BENZ" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Seller Dashboard</h1>
          <p className="text-sm text-[var(--ah-muted)]">Manage listings, views and sales.</p>
        </div>
        <Link to="/sell" className="btn-gold"><Plus className="h-4 w-4" /> Add Car</Link>
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
        {['all', 'active', 'pending', 'sold'].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`chip capitalize ${tab === t ? 'bg-gold-500 text-zinc-950' : ''}`}>{t}</button>
        ))}
      </div>

      {!list.length ? (
        <div className="mt-6"><EmptyState icon={CarIcon} title="No listings" text="Publish your first car." action={{ to: '/sell', label: 'Add Car' }} /></div>
      ) : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--ah-line)] text-xs uppercase text-[var(--ah-muted)]">
              <tr>
                <th className="p-3">Car</th><th>Price</th><th>Status</th><th>Views</th><th>♥</th><th></th>
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
                  <td className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{c.views}</td>
                  <td><Heart className="mr-1 inline h-3 w-3" />{c.favorites_count}</td>
                  <td className="space-x-1 p-3 text-right">
                    <Link to={`/sell?edit=${c.id}`} className="inline-flex rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5" title="Edit"><Pencil className="h-4 w-4" /></Link>
                    {c.status !== 'SOLD' && (
                      <button type="button" className="rounded-full p-2 hover:bg-black/5" title="Mark as sold" onClick={() => act(`/cars/${c.id}/sold`)}>Sold</button>
                    )}
                    {c.status !== 'SOLD' && (
                      <button type="button" className="rounded-full p-2 hover:bg-black/5" title="Pause" onClick={() => act(`/cars/${c.id}/pause`)}><Pause className="h-4 w-4" /></button>
                    )}
                    <button type="button" className="rounded-full p-2 text-red-500" title="Delete" onClick={() => act(`/cars/${c.id}`, 'delete')}><Trash2 className="h-4 w-4" /></button>
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
