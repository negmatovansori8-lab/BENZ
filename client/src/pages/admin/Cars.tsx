import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { api } from '../../services/api';
import type { Car } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function AdminCars() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const { push } = useToast();

  const load = () =>
    api.get(`/admin/cars?status=${status}&q=${encodeURIComponent(q)}`).then((r) => setCars(r.data.data || []));

  useEffect(() => { load().catch(() => {}); }, [status]);

  const act = async (path: string, method: 'post' | 'delete' | 'put' = 'post', body?: object) => {
    try {
      await api[method](path, body);
      push('Updated', 'success');
      load();
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    }
  };

  return (
    <div>
      <Seo title="Admin Listings — BENZ" />
      <h1 className="font-display text-3xl">Car Management</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn-gold" onClick={() => load()}>Search</button>
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'PAUSED'].map((s) => (
          <button key={s || 'all'} type="button" className={`chip ${status === s ? 'bg-gold-500 text-zinc-950' : ''}`} onClick={() => setStatus(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase text-[var(--ah-muted)]">
            <tr><th className="p-3">Listing</th><th>Seller</th><th>Price</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-t border-[var(--ah-line)]">
                <td className="p-3">
                  <Link to={`/cars/${c.id}`} className="font-medium">{c.brand} {c.model} {c.year}</Link>
                  {c.is_featured && <span className="ml-2 text-[10px] text-gold-600">FEATURED</span>}
                </td>
                <td>{c.seller_name}</td>
                <td>${Number(c.price_usd).toLocaleString()}</td>
                <td>{c.status}</td>
                <td className="space-x-1 p-3 text-right">
                  <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => act(`/admin/cars/${c.id}/approve`)}>Approve</button>
                  <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => act(`/admin/cars/${c.id}/reject`)}>Reject</button>
                  <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => act(`/admin/cars/${c.id}/feature`)}>Feature</button>
                  <button type="button" className="btn-ghost !py-1 !text-xs text-red-500" onClick={() => act(`/admin/cars/${c.id}`, 'delete')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
